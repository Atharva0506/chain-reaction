package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"

	"github.com/chain-reaction/server/internal/game"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type ClientMessage struct {
	Event   string          `json:"event"`
	Payload json.RawMessage `json:"payload"`
}

type ServerMessage struct {
	Event   string      `json:"event"`
	Payload interface{} `json:"payload"`
}

type Client struct {
	ID      string
	MatchID string
	Hub     *Hub
	Conn    *websocket.Conn
	Send    chan []byte
	mu      sync.Mutex
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()
	c.Conn.SetReadLimit(4096)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		var msg ClientMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			continue
		}

		c.Hub.HandleMessage(c, msg)
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) SendMsg(event string, payload interface{}) {
	msg := ServerMessage{Event: event, Payload: payload}
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}
	select {
	case c.Send <- data:
	default:
	}
}

type Hub struct {
	clients     map[string]*Client
	matches     map[string]map[string]*Client
	Register    chan *Client
	Unregister  chan *Client
	coordinator *game.Coordinator
	mu          sync.RWMutex
}

func NewHub(coordinator *game.Coordinator) *Hub {
	return &Hub{
		clients:     make(map[string]*Client),
		matches:     make(map[string]map[string]*Client),
		Register:    make(chan *Client, 256),
		Unregister:  make(chan *Client, 256),
		coordinator: coordinator,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.clients[client.ID] = client
			h.mu.Unlock()
		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				close(client.Send)
				if client.MatchID != "" {
					if m, ok := h.matches[client.MatchID]; ok {
						delete(m, client.ID)
						h.broadcastToMatch(client.MatchID, "PLAYER_LEFT", map[string]string{"playerId": client.ID})
					}
				}
			}
			h.mu.Unlock()
		}
	}
}

func (h *Hub) HandleMessage(client *Client, msg ClientMessage) {
	switch msg.Event {
	case "PING":
		client.SendMsg("PONG", nil)

	case "CREATE_ROOM":
		var payload struct {
			PlayerCount int `json:"playerCount"`
		}
		json.Unmarshal(msg.Payload, &payload)
		matchID, code := h.coordinator.CreatePrivateMatch(payload.PlayerCount)
		client.MatchID = matchID
		h.addToMatch(matchID, client)
		client.SendMsg("ROOM_CREATED", map[string]string{
			"roomCode": code,
			"matchId":  matchID,
		})

	case "JOIN_ROOM":
		var payload struct {
			RoomCode string `json:"roomCode"`
		}
		json.Unmarshal(msg.Payload, &payload)
		matchID, err := h.coordinator.GetMatchByRoomCode(payload.RoomCode)
		if err != nil {
			client.SendMsg("ERROR", map[string]string{
				"code":    "ROOM_NOT_FOUND",
				"message": "Room not found",
			})
			return
		}

		player := game.Player{
			ID:      client.ID,
			Name:    "Player",
			IsAlive: true,
			IsBot:   false,
		}
		state, err := h.coordinator.JoinMatch(matchID, player)
		if err != nil {
			client.SendMsg("ERROR", map[string]string{
				"code":    "JOIN_FAILED",
				"message": err.Error(),
			})
			return
		}

		client.MatchID = matchID
		h.addToMatch(matchID, client)
		h.broadcastToMatch(matchID, "PLAYER_JOINED", map[string]interface{}{
			"playerId": client.ID,
			"players":  state.Players,
		})

		if len(state.Players) >= 2 {
			state.Status = "in_progress"
			h.broadcastToMatch(matchID, "MATCH_START", map[string]interface{}{
				"matchId":     matchID,
				"players":     state.Players,
				"board":       state.Board,
				"currentTurn": state.CurrentTurn,
			})
		}

	case "QUEUE_MATCHMAKING":
		var payload struct {
			PlayerName string `json:"playerName"`
		}
		json.Unmarshal(msg.Payload, &payload)
		name := payload.PlayerName
		if name == "" {
			name = "Player"
		}
		h.mu.Lock()
		client.ID = client.ID
		h.mu.Unlock()
		client.SendMsg("MATCHMAKING_STATUS", map[string]interface{}{
			"status": "queued",
		})

	case "MAKE_MOVE":
		var payload struct {
			MatchID  string        `json:"matchId"`
			Position game.Position `json:"position"`
		}
		json.Unmarshal(msg.Payload, &payload)

		mid := payload.MatchID
		if mid == "" {
			mid = client.MatchID
		}

		state, steps, err := h.coordinator.ProcessMove(mid, client.ID, payload.Position)
		if err != nil {
			client.SendMsg("ERROR", map[string]string{
				"code":    "INVALID_MOVE",
				"message": err.Error(),
			})
			return
		}

		allChanges := make([]game.CellDiff, 0)
		allExplosions := make([]game.Position, 0)
		for _, s := range steps {
			allChanges = append(allChanges, s.Changes...)
			allExplosions = append(allExplosions, s.Explosions...)
		}

		h.broadcastToMatch(mid, "BOARD_UPDATE", map[string]interface{}{
			"diff": map[string]interface{}{
				"changes":    allChanges,
				"explosions": allExplosions,
			},
			"currentTurn": state.CurrentTurn,
			"turnNumber":  state.TurnNumber,
			"players":     state.Players,
		})

		if state.Status == "finished" {
			var winner *game.Player
			for i := range state.Players {
				if state.Players[i].ID == state.WinnerID {
					winner = &state.Players[i]
					break
				}
			}
			h.broadcastToMatch(mid, "MATCH_END", map[string]interface{}{
				"winner":     winner,
				"finalBoard": state.Board,
				"totalTurns": state.TurnNumber,
			})
		} else {
			h.broadcastToMatch(mid, "TURN_CHANGE", map[string]interface{}{
				"currentTurn": state.CurrentTurn,
				"turnNumber":  state.TurnNumber,
				"timeoutMs":   30000,
			})
		}

	case "LEAVE_MATCH":
		if client.MatchID != "" {
			h.removeFromMatch(client.MatchID, client)
			client.MatchID = ""
		}
	}
}

func (h *Hub) addToMatch(matchID string, client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if _, ok := h.matches[matchID]; !ok {
		h.matches[matchID] = make(map[string]*Client)
	}
	h.matches[matchID][client.ID] = client
}

func (h *Hub) removeFromMatch(matchID string, client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if m, ok := h.matches[matchID]; ok {
		delete(m, client.ID)
	}
}

func (h *Hub) broadcastToMatch(matchID string, event string, payload interface{}) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	clients, ok := h.matches[matchID]
	if !ok {
		return
	}
	for _, c := range clients {
		c.SendMsg(event, payload)
	}
}

func (h *Hub) SendToClient(clientID string, event string, payload interface{}) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if c, ok := h.clients[clientID]; ok {
		c.SendMsg(event, payload)
	}
}

func (h *Hub) AddClientToMatch(matchID string, clientID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if c, ok := h.clients[clientID]; ok {
		c.MatchID = matchID
		if _, ok := h.matches[matchID]; !ok {
			h.matches[matchID] = make(map[string]*Client)
		}
		h.matches[matchID][clientID] = c
	}
}

func (h *Hub) BroadcastToMatch(matchID string, event string, payload interface{}) {
	h.broadcastToMatch(matchID, event, payload)
}

func HandleConnection(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("upgrade error: %v", err)
		return
	}

	client := &Client{
		ID:   generateID(),
		Hub:  hub,
		Conn: conn,
		Send: make(chan []byte, 256),
	}

	hub.Register <- client
	go client.WritePump()
	go client.ReadPump()
}

func generateID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
		time.Sleep(time.Nanosecond)
	}
	return string(b)
}

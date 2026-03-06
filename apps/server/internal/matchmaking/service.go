package matchmaking

import (
	"log"
	"sync"
	"time"

	"github.com/chain-reaction/server/internal/game"
	"github.com/chain-reaction/server/internal/ws"
)

type QueueEntry struct {
	ClientID   string
	PlayerName string
	JoinedAt   time.Time
}

type Service struct {
	coordinator *game.Coordinator
	hub         *ws.Hub
	queue       []QueueEntry
	mu          sync.Mutex
}

func NewService(coordinator *game.Coordinator, hub *ws.Hub) *Service {
	return &Service{
		coordinator: coordinator,
		hub:         hub,
		queue:       make([]QueueEntry, 0),
	}
}

func (s *Service) AddToQueue(clientID, playerName string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, e := range s.queue {
		if e.ClientID == clientID {
			return
		}
	}
	s.queue = append(s.queue, QueueEntry{
		ClientID:   clientID,
		PlayerName: playerName,
		JoinedAt:   time.Now(),
	})
}

func (s *Service) RemoveFromQueue(clientID string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i, e := range s.queue {
		if e.ClientID == clientID {
			s.queue = append(s.queue[:i], s.queue[i+1:]...)
			return
		}
	}
}

func (s *Service) Run() {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		s.tryMatch()
	}
}

func (s *Service) tryMatch() {
	s.mu.Lock()
	defer s.mu.Unlock()

	for len(s.queue) >= 2 {
		p1 := s.queue[0]
		p2 := s.queue[1]
		s.queue = s.queue[2:]

		players := []game.Player{
			{ID: p1.ClientID, Name: p1.PlayerName, Color: game.ColorRed, IsAlive: true, IsBot: false},
			{ID: p2.ClientID, Name: p2.PlayerName, Color: game.ColorGreen, IsAlive: true, IsBot: false},
		}

		state, err := s.coordinator.CreateMatch(players)
		if err != nil {
			log.Printf("matchmaking create error: %v", err)
			continue
		}

		s.hub.AddClientToMatch(state.MatchID, p1.ClientID)
		s.hub.AddClientToMatch(state.MatchID, p2.ClientID)

		payload := map[string]interface{}{
			"matchId":     state.MatchID,
			"players":     state.Players,
			"board":       state.Board,
			"currentTurn": state.CurrentTurn,
		}
		s.hub.BroadcastToMatch(state.MatchID, "MATCH_START", payload)

		log.Printf("matched %s vs %s → %s", p1.PlayerName, p2.PlayerName, state.MatchID)
	}
}

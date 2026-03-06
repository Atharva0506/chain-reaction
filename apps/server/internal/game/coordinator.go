package game

import (
	"fmt"
	"math/rand"
	"sync"
	"time"

	"github.com/google/uuid"

	redisstore "github.com/chain-reaction/server/internal/redis"
)

type Coordinator struct {
	engine  *Engine
	store   *redisstore.GameStore
	matches map[string]*MatchState
	mu      sync.RWMutex
}

func NewCoordinator(engine *Engine, store *redisstore.GameStore) *Coordinator {
	return &Coordinator{
		engine:  engine,
		store:   store,
		matches: make(map[string]*MatchState),
	}
}

func (c *Coordinator) CreateMatch(players []Player) (*MatchState, error) {
	matchID := uuid.New().String()
	board := c.engine.CreateEmptyBoard(BoardRows, BoardCols)

	state := &MatchState{
		MatchID:     matchID,
		Board:       board,
		Players:     players,
		CurrentTurn: 0,
		TurnNumber:  0,
		Status:      "in_progress",
	}

	c.mu.Lock()
	c.matches[matchID] = state
	c.mu.Unlock()

	c.store.SaveMatch(state.MatchID, state)
	return state, nil
}

func (c *Coordinator) CreatePrivateMatch(playerCount int) (string, string) {
	matchID := uuid.New().String()
	code := generateRoomCode()
	board := c.engine.CreateEmptyBoard(BoardRows, BoardCols)

	state := &MatchState{
		MatchID:     matchID,
		Board:       board,
		Players:     make([]Player, 0),
		CurrentTurn: 0,
		TurnNumber:  0,
		Status:      "waiting",
	}

	c.mu.Lock()
	c.matches[matchID] = state
	c.mu.Unlock()

	c.store.SaveRoomCode(code, matchID)
	c.store.SaveMatch(matchID, state)
	return matchID, code
}

func (c *Coordinator) JoinMatch(matchID string, player Player) (*MatchState, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	state, ok := c.matches[matchID]
	if !ok {
		return nil, fmt.Errorf("match not found")
	}

	player.Color = PlayerColor(len(state.Players))
	player.IsAlive = true
	state.Players = append(state.Players, player)

	c.store.SaveMatch(matchID, state)
	return state, nil
}

func (c *Coordinator) GetMatchByRoomCode(code string) (string, error) {
	return c.store.GetRoomCode(code)
}

func (c *Coordinator) ProcessMove(matchID string, playerID string, pos Position) (*MatchState, []BoardDiff, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	state, ok := c.matches[matchID]
	if !ok {
		return nil, nil, fmt.Errorf("match not found")
	}

	if state.Status != "in_progress" {
		return nil, nil, fmt.Errorf("match not in progress")
	}

	currentPlayer := state.Players[state.CurrentTurn]
	if currentPlayer.ID != playerID {
		return nil, nil, fmt.Errorf("not your turn")
	}

	if !c.engine.IsValidMove(state.Board, pos, currentPlayer.Color) {
		return nil, nil, fmt.Errorf("invalid move")
	}

	newBoard, steps := c.engine.ApplyMove(state.Board, pos, currentPlayer.Color)
	state.Board = newBoard
	state.TurnNumber++

	winner := c.engine.CheckWinner(state.Board, state.Players, state.TurnNumber)
	if winner != nil {
		state.Status = "finished"
		state.WinnerID = winner.ID
	} else {
		state.CurrentTurn = (state.CurrentTurn + 1) % len(state.Players)
	}

	c.store.SaveMatch(matchID, state)
	return state, steps, nil
}

func (c *Coordinator) GetMatch(matchID string) (*MatchState, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	state, ok := c.matches[matchID]
	return state, ok
}

func (c *Coordinator) RemoveMatch(matchID string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.matches, matchID)
}

func generateRoomCode() string {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	code := make([]byte, 6)
	for i := range code {
		code[i] = chars[rng.Intn(len(chars))]
	}
	return string(code)
}

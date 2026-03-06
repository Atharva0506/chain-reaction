package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

func NewClient(url string) (*redis.Client, error) {
	opts, err := redis.ParseURL(url)
	if err != nil {
		return nil, fmt.Errorf("parse redis url: %w", err)
	}
	client := redis.NewClient(opts)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis ping: %w", err)
	}
	return client, nil
}

type GameStore struct {
	rdb *redis.Client
}

func NewGameStore(rdb *redis.Client) *GameStore {
	return &GameStore{rdb: rdb}
}

func (s *GameStore) SaveMatch(matchID string, state interface{}) error {
	data, err := json.Marshal(state)
	if err != nil {
		return err
	}
	ctx := context.Background()
	return s.rdb.Set(ctx, "match:"+matchID, data, 2*time.Hour).Err()
}

func (s *GameStore) GetMatch(matchID string) ([]byte, error) {
	ctx := context.Background()
	return s.rdb.Get(ctx, "match:"+matchID).Bytes()
}

func (s *GameStore) DeleteMatch(matchID string) error {
	ctx := context.Background()
	return s.rdb.Del(ctx, "match:"+matchID).Err()
}

func (s *GameStore) SaveRoomCode(code, matchID string) error {
	ctx := context.Background()
	return s.rdb.Set(ctx, "room:"+code, matchID, 1*time.Hour).Err()
}

func (s *GameStore) GetRoomCode(code string) (string, error) {
	ctx := context.Background()
	return s.rdb.Get(ctx, "room:"+code).Result()
}

func (s *GameStore) PublishEvent(channel string, data interface{}) error {
	payload, err := json.Marshal(data)
	if err != nil {
		return err
	}
	ctx := context.Background()
	return s.rdb.Publish(ctx, channel, payload).Err()
}

func (s *GameStore) EnqueueJob(queue string, data interface{}) error {
	payload, err := json.Marshal(data)
	if err != nil {
		return err
	}
	ctx := context.Background()
	return s.rdb.LPush(ctx, "queue:"+queue, payload).Err()
}

func (s *GameStore) DequeueJob(queue string) ([]byte, error) {
	ctx := context.Background()
	result, err := s.rdb.BRPop(ctx, 5*time.Second, "queue:"+queue).Result()
	if err != nil {
		return nil, err
	}
	if len(result) < 2 {
		return nil, fmt.Errorf("empty result")
	}
	return []byte(result[1]), nil
}

func (s *GameStore) SaveLeaderboard(entry interface{}) error {
	data, err := json.Marshal(entry)
	if err != nil {
		return err
	}
	ctx := context.Background()
	return s.rdb.Set(ctx, "leaderboard", data, 0).Err()
}

func (s *GameStore) GetLeaderboard() ([]byte, error) {
	ctx := context.Background()
	return s.rdb.Get(ctx, "leaderboard").Bytes()
}

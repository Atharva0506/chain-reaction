package api

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"

	redisstore "github.com/chain-reaction/server/internal/redis"
)

func RegisterRoutes(r chi.Router, store *redisstore.GameStore) {
	r.Get("/health", healthHandler)
	r.Get("/leaderboard", leaderboardHandler(store))
	r.Get("/match/{matchId}", matchHandler(store))
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func leaderboardHandler(store *redisstore.GameStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data, err := store.GetLeaderboard()
		if err != nil {
			writeJSON(w, http.StatusOK, []interface{}{})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(data)
	}
}

func matchHandler(store *redisstore.GameStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		matchID := chi.URLParam(r, "matchId")
		data, err := store.GetMatch(matchID)
		if err != nil {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "match not found"})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(data)
	}
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

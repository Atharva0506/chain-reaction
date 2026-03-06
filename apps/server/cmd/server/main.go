package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"github.com/chain-reaction/server/internal/api"
	"github.com/chain-reaction/server/internal/game"
	"github.com/chain-reaction/server/internal/matchmaking"
	redisstore "github.com/chain-reaction/server/internal/redis"
	"github.com/chain-reaction/server/internal/ws"
)

func main() {
	_ = godotenv.Load("../../.env")

	redisURL := envOrDefault("REDIS_URL", "redis://localhost:6379")
	addr := envOrDefault("SERVER_ADDR", ":8080")

	rdb, err := redisstore.NewClient(redisURL)
	if err != nil {
		log.Fatalf("redis connect failed: %v", err)
	}

	store := redisstore.NewGameStore(rdb)
	engine := game.NewEngine()
	coordinator := game.NewCoordinator(engine, store)
	hub := ws.NewHub(coordinator)
	mm := matchmaking.NewService(coordinator, hub)

	go hub.Run()
	go mm.Run()

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Heartbeat("/health"))
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/ws", func(w http.ResponseWriter, r *http.Request) {
		ws.HandleConnection(hub, w, r)
	})

	r.Route("/api", func(r chi.Router) {
		api.RegisterRoutes(r, store)
	})

	srv := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("server listening on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("server shutdown failed: %v", err)
	}
	log.Println("server stopped")
}

func envOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

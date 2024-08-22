package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

func initRedisClient() *redis.Client {
	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "localhost"
	}

	return redis.NewClient(&redis.Options{
		Addr: redisHost + ":6379",
	})
}

func getCount(rdb *redis.Client, w http.ResponseWriter, _ *http.Request) {
	countStr, err := rdb.Get(ctx, "count").Result()
	if err == redis.Nil {
		countStr = "0"
	} else if err != nil {
		http.Error(w, "Failed to get count", http.StatusInternalServerError)
		return
	}

	count, _ := strconv.Atoi(countStr)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(map[string]int{"count": count})
}

func incrementCount(rdb *redis.Client, w http.ResponseWriter, _ *http.Request) {
	countStr, err := rdb.Get(ctx, "count").Result()
	if err == redis.Nil {
		countStr = "0"
	} else if err != nil {
		http.Error(w, "Failed to get count", http.StatusInternalServerError)
		return
	}

	count, _ := strconv.Atoi(countStr)
	count++

	err = rdb.Set(ctx, "count", count, 0).Err()
	if err != nil {
		fmt.Printf("%v\n", err)
		http.Error(w, "Failed to update count", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(map[string]int{"count": count})
}

func main() {
	rdb := initRedisClient()

	http.HandleFunc("/api/get-count", func(w http.ResponseWriter, r *http.Request) {
		getCount(rdb, w, r)
	})
	http.HandleFunc("/api/increment-count", func(w http.ResponseWriter, r *http.Request) {
		incrementCount(rdb, w, r)
	})

	fmt.Println("Server started at http://localhost:8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}

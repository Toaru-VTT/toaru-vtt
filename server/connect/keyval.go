package connect

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/vmihailenco/msgpack/v5"
)

var redisClient *redis.Client

// KeyVal encapsulates hot storage for managing game state.
type KeyVal interface {
	Get(key string) *Canvas
	Put(key string, val *Canvas) error
}

type Redis struct {
	client        *redis.Client
	ctx           context.Context
	retentionTime time.Duration
}

func NewRedisKeyVal(ctx context.Context) KeyVal {
	if redisClient == nil {
		redisHost := os.Getenv("REDIS_HOST")
		if redisHost == "" {
			redisHost = "localhost"
		}
		redisClient = redis.NewClient(&redis.Options{
			Addr: redisHost + ":6379",
		})
	}

	return &Redis{
		client:        redisClient,
		ctx:           ctx,
		retentionTime: 24 * time.Hour, // TODO determine actual retention policy
	}
}

func (r *Redis) Get(key string) *Canvas {
	data, err := r.client.Get(r.ctx, key).Bytes()
	if err == redis.Nil {
		return nil
	} else if err != nil {
		log.Printf("error fetching from Redis: %v", err)
		return nil
	}

	canvas := &Canvas{}
	msgpack.Unmarshal(data, &canvas)
	return canvas
}

func (r *Redis) Put(key string, canvas *Canvas) error {
	data, err := msgpack.Marshal(canvas)
	if err != nil {
		return err
	}

	err = r.client.Set(r.ctx, key, data, r.retentionTime).Err()
	return err
}

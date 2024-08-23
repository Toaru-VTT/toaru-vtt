package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/Swiddis/toaru-server/connect"
)

var ctx = context.Background()
var rdb = connect.NewRedisKeyVal(ctx, 24*time.Hour)

// Helper to apply correct headers and send the response over the given writer
func sendHttpJson(w http.ResponseWriter, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(data)
}

func startSession() (string, *connect.Canvas) {
	startState := &connect.Canvas{}
	sessionCode := connect.GetCode(rdb, startState)
	return sessionCode, startState
}

func readCanvas(reader io.Reader, length int64) (connect.Canvas, error) {
	if length < 0 {
		return connect.Canvas{}, fmt.Errorf("content length must be specified")
	} else if length > 20000 {
		return connect.Canvas{}, fmt.Errorf("content length too large")
	}

	reqState := connect.Canvas{}
	reqBody := make([]byte, length)
	_, err := reader.Read(reqBody)
	if err != nil && err != io.EOF {
		return reqState, err
	}
	err = json.Unmarshal(reqBody, &reqState)
	return reqState, err
}

func main() {
	http.HandleFunc("POST /session", func(w http.ResponseWriter, _ *http.Request) {
		session, state := startSession()
		sendHttpJson(w, map[string]any{"session": session, "state": state})
	})
	http.HandleFunc("GET /session/{code}", func(w http.ResponseWriter, r *http.Request) {
		state := rdb.Get(r.PathValue("code"))
		if state == nil {
			w.WriteHeader(http.StatusNotFound)
			sendHttpJson(w, map[string]string{"error": "not found"})
		} else {
			sendHttpJson(w, map[string]any{"state": state})
		}
	})
	http.HandleFunc("POST /session/{code}", func(w http.ResponseWriter, r *http.Request) {
		reqState, err := readCanvas(r.Body, r.ContentLength)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			log.Printf("failed to parse canvas: %v\n", err)
			sendHttpJson(w, map[string]string{"error": "unable to parse message data"})
			return
		}

		state := rdb.Get(r.PathValue("code"))
		if state == nil {
			w.WriteHeader(http.StatusNotFound)
			sendHttpJson(w, map[string]string{"error": "not found"})
		} else {
			newState := state.Merge(&reqState)
			rdb.Put(r.PathValue("code"), &newState)
			sendHttpJson(w, map[string]any{"state": newState})
		}
	})

	fmt.Println("Server started at http://localhost:8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}

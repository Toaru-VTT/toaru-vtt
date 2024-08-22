FROM golang:1.22 AS builder
WORKDIR /app
ENV GOOS=linux GARCH=amd64 CGO_ENABLED=0

COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o dist/server
RUN ls -l /app/dist

FROM alpine:latest
COPY --from=builder /app/dist/server /app/server
EXPOSE 8081
ENTRYPOINT ["/app/server"]

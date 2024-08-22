# Define directories
SERVER_DIR := ./server
WEBSITE_DIR := ./website

# Define commands
.PHONY: all dev build test deploy

all: build

dev:
	@echo "Starting development environment..."
	(docker compose --profile dev up --detach) &
	(cd $(SERVER_DIR) && go run main.go) &
	(cd $(WEBSITE_DIR) && yarn dev)

build:
	@echo "Building backend..."
	(cd $(SERVER_DIR) && go build -o dist/server)
	@echo "Building frontend..."
	(cd $(WEBSITE_DIR) && yarn build)

test:
	@echo "Running tests for backend..."
	(cd $(SERVER_DIR) && go test ./...)
	@echo "Running tests for frontend..."
	(cd $(WEBSITE_DIR) && yarn test)

deploy:
	@echo "Building the application containers..."
	(docker compose build)
	@echo "Deploying the application..."
	(docker compose --profile deploy up --detach)

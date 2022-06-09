SHELL := /bin/bash

run: 
	scripts/permiss.sh && docker-compose up -d

build: 
	scripts/permiss.sh && docker-compose up --build

flushredis:
	docker exec -it redis-cache redis-cli flushAll

ssh:
	docker exec -it fcx-backend bash

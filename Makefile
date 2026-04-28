COMPOSE := docker compose -f infra/docker-compose.yml

.PHONY: help up down logs ps seed migrate fresh test test-backend test-frontend lint typecheck shell-backend shell-frontend openapi types contract

help:
	@echo "Targets:"
	@echo "  up              start the full stack"
	@echo "  down            stop the stack"
	@echo "  logs            tail logs"
	@echo "  ps              list services"
	@echo "  seed            migrate + seed the database"
	@echo "  migrate         run pending migrations"
	@echo "  fresh           drop + remigrate + seed"
	@echo "  test            backend + frontend test suites"
	@echo "  test-backend    PHPUnit (26 tests)"
	@echo "  test-frontend   Jest / RTL (10 tests)"
	@echo "  lint            Pint + ESLint"
	@echo "  typecheck       PHPStan + tsc --noEmit"
	@echo "  openapi         regenerate OpenAPI spec at backend/api.json"
	@echo "  types           regenerate TS types from the OpenAPI spec"
	@echo "  contract        openapi + types + typecheck (drift gate)"
	@echo "  shell-backend   shell into backend container"
	@echo "  shell-frontend  shell into frontend container"

up:
	$(COMPOSE) up -d --build
	@echo "frontend: http://localhost:3000"
	@echo "api:      http://localhost:8000/api/v1"

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

migrate:
	$(COMPOSE) exec -T backend php artisan migrate

seed:
	$(COMPOSE) exec -T backend php artisan migrate --seed

fresh:
	$(COMPOSE) exec -T backend php artisan migrate:fresh --seed
	$(COMPOSE) exec -T redis redis-cli FLUSHALL

test: test-backend test-frontend

test-backend:
	$(COMPOSE) exec -T backend php artisan test

test-frontend:
	$(COMPOSE) exec -T frontend npm test

lint:
	$(COMPOSE) exec -T backend vendor/bin/pint --test
	$(COMPOSE) exec -T frontend npm run lint

typecheck:
	$(COMPOSE) exec -T backend vendor/bin/phpstan analyse --memory-limit=1G
	$(COMPOSE) exec -T frontend npx tsc --noEmit

shell-backend:
	$(COMPOSE) exec backend sh

shell-frontend:
	$(COMPOSE) exec frontend sh

openapi:
	$(COMPOSE) exec -T backend php artisan scramble:export

types:
	$(COMPOSE) exec -T frontend npm run types

contract: openapi types typecheck

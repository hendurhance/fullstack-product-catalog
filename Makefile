COMPOSE := docker compose -f infra/docker-compose.yml

.PHONY: help up down logs ps seed migrate fresh test test-backend test-frontend e2e bench lint typecheck shell-backend shell-frontend openapi types contract

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
	@echo "  test-backend    Pest"
	@echo "  test-frontend   Vitest"
	@echo "  e2e             Playwright against compose"
	@echo "  bench           wrk against /api/v1/products"
	@echo "  lint            Pint + ESLint"
	@echo "  typecheck       PHPStan + tsc --strict"
	@echo "  shell-backend   shell into backend container"
	@echo "  shell-frontend  shell into frontend container"
	@echo "  openapi         regenerate OpenAPI spec at backend/api.json"
	@echo "  types           regenerate TS types from the OpenAPI spec"
	@echo "  contract        openapi + types + tsc --noEmit (drift gate)"

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
	$(COMPOSE) exec backend php artisan migrate

seed:
	$(COMPOSE) exec backend php artisan migrate --seed

fresh:
	$(COMPOSE) exec backend php artisan migrate:fresh --seed
	$(COMPOSE) exec redis redis-cli FLUSHALL

test: test-backend test-frontend

test-backend:
	$(COMPOSE) exec backend php artisan test

test-frontend:
	$(COMPOSE) exec frontend npm test

e2e:
	$(COMPOSE) exec frontend npx playwright test

bench:
	$(COMPOSE) exec backend sh -lc "command -v wrk >/dev/null || (echo 'install wrk in the image first' && exit 1); wrk -t4 -c50 -d20s http://localhost:8000/api/v1/products"

lint:
	$(COMPOSE) exec backend vendor/bin/pint --test
	$(COMPOSE) exec frontend npm run lint

typecheck:
	$(COMPOSE) exec backend vendor/bin/phpstan analyse --memory-limit=1G
	$(COMPOSE) exec frontend npx tsc --noEmit

shell-backend:
	$(COMPOSE) exec backend sh

shell-frontend:
	$(COMPOSE) exec frontend sh

openapi:
	$(COMPOSE) exec backend php artisan scramble:export

types:
	$(COMPOSE) exec frontend npm run types

contract: openapi types
	$(COMPOSE) exec frontend npm run types:check

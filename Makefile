# ===============================
# 📱 CLIENT MAKEFILE
# For: Node.js, Nginx, Vite
# Compatible with Global Makefile
# ===============================

SERVICE_NAME := CLIENT

# Compose files
COMPOSE_DEV := compose.dev.yaml
COMPOSE_STAGING := compose.staging.yaml
COMPOSE_PROD := compose.prod.yaml

# Environment files
ENV_DEV := .env.dev
ENV_STAGING := .env.staging
ENV_PROD := .env.prod

# Get Domain
ifeq ($(OS),Windows_NT)
    SHELL := cmd.exe
    .SHELLFLAGS := /C

    DEV_DOMAIN := $(shell for /f "tokens=2 delims==" %%A in ('findstr "^CLIENT_DOMAIN=" $(ENV_DEV)') do @echo %%A)
    DEV_DOMAIN := $(if $(DEV_DOMAIN),$(DEV_DOMAIN),localhost)

    STAGING_DOMAIN := $(shell for /f "tokens=2 delims==" %%A in ('findstr "^CLIENT_DOMAIN=" $(ENV_STAGING)') do @echo %%A)
    STAGING_DOMAIN := $(if $(STAGING_DOMAIN),$(STAGING_DOMAIN),localhost)
	
	PROD_DOMAIN := $(shell for /f "tokens=2 delims==" %%A in ('findstr "^CLIENT_DOMAIN=" $(ENV_PROD)') do @echo %%A)
    PROD_DOMAIN := $(if $(PROD_DOMAIN),$(PROD_DOMAIN),localhost)
else
    # Unix version
	DEV_DOMAIN := $(shell grep '^CLIENT_DOMAIN=' $(ENV_DEV) 2>/dev/null | cut -d '=' -f2)
    DEV_DOMAIN := $(if $(DEV_DOMAIN),$(DEV_DOMAIN),localhost)

    STAGING_DOMAIN := $(shell grep '^CLIENT_DOMAIN=' $(ENV_STAGING) 2>/dev/null | cut -d '=' -f2)
    STAGING_DOMAIN := $(if $(STAGING_DOMAIN),$(STAGING_DOMAIN),localhost)

	PROD_DOMAIN := $(shell grep '^CLIENT_DOMAIN=' $(ENV_PROD) 2>/dev/null | cut -d '=' -f2)
    PROD_DOMAIN := $(if $(PROD_DOMAIN),$(PROD_DOMAIN),localhost)
endif

# URLs (Backend APIs)
DEV_URL := http://$(DEV_DOMAIN):5173
STAGING_URL := https://$(STAGING_DOMAIN):8101
PROD_URL := https://$(PROD_DOMAIN)

# ===============================
# 🧩 DEV
# ===============================

up-dev:
	@echo "🚀 Starting $(SERVICE_NAME) (DEV)..."
	docker compose -f $(COMPOSE_DEV) --env-file $(ENV_DEV) up -d
	@echo "✅ $(SERVICE_NAME) (DEV) started successfully!"
	@echo "🌐 Available at (DEV): $(DEV_URL)"

up-build-dev:
	@echo "🔄 Building & starting $(SERVICE_NAME) (DEV) (with cache)..."
	docker compose -f $(COMPOSE_DEV) --env-file $(ENV_DEV) up -d --build
	@echo "✅ $(SERVICE_NAME) (DEV) built & started!"
	@echo "🌐 Available at (DEV): $(DEV_URL)"

rebuild-dev:
	@echo "🧱 Rebuilding $(SERVICE_NAME) (DEV) from scratch (no cache)..."
	docker compose -f $(COMPOSE_DEV) --env-file $(ENV_DEV) build --no-cache
	@echo "🚀 Starting $(SERVICE_NAME) (DEV)..."
	docker compose -f $(COMPOSE_DEV) --env-file $(ENV_DEV) up -d
	@echo "✅ $(SERVICE_NAME) (DEV) rebuilt & started!"
	@echo "🌐 Available at (DEV): $(DEV_URL)"

down-dev:
	@echo "🛑 Stopping $(SERVICE_NAME) (DEV)..."
	docker compose -f $(COMPOSE_DEV) --env-file $(ENV_DEV) down
	@echo "✅ $(SERVICE_NAME) (DEV) stopped."

reset-dev:
	@echo "🧹 Resetting $(SERVICE_NAME) (DEV)..."
	docker compose -f $(COMPOSE_DEV) --env-file $(ENV_DEV) down -v
	@echo "✅ $(SERVICE_NAME) (DEV) reset complete."

clean-dev:
	@echo "🔥 Cleaning $(SERVICE_NAME) (DEV) completely..."
	docker compose -f $(COMPOSE_DEV) --env-file $(ENV_DEV) down --rmi all -v --remove-orphans
	@echo "✅ $(SERVICE_NAME) (DEV) cleaned completely."

logs-dev:
	@echo "📜 Logs for $(SERVICE_NAME) (DEV)..."
	docker compose -f $(COMPOSE_DEV) --env-file $(ENV_DEV) logs -f
	@echo "🌐 Available at (DEV): $(DEV_URL)"

# ===============================
# 🧩 STAGING
# ===============================

up-staging:
	@echo "🚀 Starting $(SERVICE_NAME) (STAGING)..."
	docker compose -f $(COMPOSE_STAGING) --env-file $(ENV_STAGING) up -d
	@echo "✅ $(SERVICE_NAME) (STAGING) started successfully!"
	@echo "🌐 Available at (STAGING): $(STAGING_URL)"

rebuild-staging:
	@echo "🧱 Rebuilding $(SERVICE_NAME) (STAGING) from scratch (no cache)..."
	docker compose -f $(COMPOSE_STAGING) --env-file $(ENV_STAGING) build --no-cache
	@echo "🚀 Starting $(SERVICE_NAME) (STAGING)..."
	docker compose -f $(COMPOSE_STAGING) --env-file $(ENV_STAGING) up -d
	@echo "✅ $(SERVICE_NAME) (STAGING) rebuilt & started!"
	@echo "🌐 Available at (STAGING): $(STAGING_URL)"

down-staging:
	@echo "🛑 Stopping $(SERVICE_NAME) (STAGING)..."
	docker compose -f $(COMPOSE_STAGING) --env-file $(ENV_STAGING) down
	@echo "✅ $(SERVICE_NAME) (STAGING) stopped."

reset-staging:
	@echo "🧹 Resetting $(SERVICE_NAME) (STAGING)..."
	docker compose -f $(COMPOSE_STAGING) --env-file $(ENV_STAGING) down -v
	@echo "✅ $(SERVICE_NAME) (STAGING) reset complete."

clean-staging:
	@echo "🔥 Cleaning $(SERVICE_NAME) (STAGING) completely..."
	docker compose -f $(COMPOSE_STAGING) --env-file $(ENV_STAGING) down --rmi all -v --remove-orphans
	@echo "✅ $(SERVICE_NAME) (STAGING) cleaned completely."

logs-staging:
	@echo "📜 Logs for $(SERVICE_NAME) (STAGING)..."
	docker compose -f $(COMPOSE_STAGING) --env-file $(ENV_STAGING) logs -f
	@echo "🌐 Available at (STAGING): $(STAGING_URL)"

# ===============================
# 🧩 PROD
# ===============================

up-prod:
	@echo "🚀 Starting $(SERVICE_NAME) (PROD)..."
	docker compose -f $(COMPOSE_PROD) --env-file $(ENV_PROD) up -d
	@echo "✅ $(SERVICE_NAME) (PROD) started successfully!"
	@echo "🌐 Available at (PROD): $(PROD_URL)"

rebuild-prod:
	@echo "🧱 Rebuilding $(SERVICE_NAME) (PROD) from scratch (no cache)..."
	docker compose -f $(COMPOSE_PROD) --env-file $(ENV_PROD) build --no-cache
	@echo "🚀 Starting $(SERVICE_NAME) (PROD)..."
	docker compose -f $(COMPOSE_PROD) --env-file $(ENV_PROD) up -d
	@echo "✅ $(SERVICE_NAME) (PROD) rebuilt & started!"
	@echo "🌐 Available at (PROD): $(PROD_URL)"

down-prod:
	@echo "🛑 Stopping $(SERVICE_NAME) (PROD)..."
	docker compose -f $(COMPOSE_PROD) --env-file $(ENV_PROD) down
	@echo "✅ $(SERVICE_NAME) (PROD) stopped."

reset-prod:
	@echo "🧹 Resetting $(SERVICE_NAME) (PROD)..."
	docker compose -f $(COMPOSE_PROD) --env-file $(ENV_PROD) down -v
	@echo "✅ $(SERVICE_NAME) (PROD) reset complete."

clean-prod:
	@echo "🔥 Cleaning $(SERVICE_NAME) (PROD) completely..."
	docker compose -f $(COMPOSE_PROD) --env-file $(ENV_PROD) down --rmi all -v --remove-orphans
	@echo "✅ $(SERVICE_NAME) (PROD) cleaned completely."

logs-prod:
	@echo "📜 Logs for $(SERVICE_NAME) (PROD)..."
	docker compose -f $(COMPOSE_PROD) --env-file $(ENV_PROD) logs -f
	@echo "🌐 Available at (PROD): $(PROD_URL)"

# ===============================
# 📖 HELP
# ===============================

help:
	@echo "📖 Available $(SERVICE_NAME) commands:"
	@echo "  make up-dev / up-build-dev / up-staging / up-prod  -> Start $(SERVICE_NAME)"
	@echo "  make rebuild-dev / rebuild-staging / rebuild-prod  -> Rebuild images (no cache)"
	@echo "  make down-dev / down-staging / down-prod           -> Stop containers"
	@echo "  make reset-dev / reset-staging / reset-prod        -> Down + remove volumes"
	@echo "  make clean-dev / clean-staging / clean-prod        -> Remove images + volumes"
	@echo "  make logs-dev / logs-staging / logs-prod           -> Follow logs"
	@echo ""
	@echo "🌍 URLs:"
	@echo "  DEV: $(DEV_URL)"
	@echo "  STAGING: $(STAGING_URL)"
	@echo "  PROD: $(PROD_URL)"
	@echo ""
	@echo "ℹ️ Notes:"
	@echo "  - 🔄 up-build-dev -> Builds containers with cache before starting (only for DEV)"

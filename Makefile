
PROJECT_NAME := $(shell basename "$(PWD)")
PROJ_BASE := $(shell pwd -LP)
PROJ_TEMP_PATH := $(PROJ_BASE)/temp
PROJ_AUTH_PATH := $(PROJ_BASE)/auth
PROJ_MAIN_PATH := $(PROJ_BASE)/main
STDOUT_MAIN := $(PROJ_TEMP_PATH)/main.log
PID_MAIN := $(PROJ_TEMP_PATH)/main.pid
STDOUT_AUTH := $(PROJ_TEMP_PATH)/auth.log
PID_AUTH := $(PROJ_TEMP_PATH)/auth.pid


## install: install npm
install:
	@echo " > Install packages"
	@cd $(PROJ_MAIN_PATH) && npm i
	@cd $(PROJ_AUTH_PATH) && npm i

## create-db-user: Be careful!!! create databases and user for it
create-db-user:
	@echo " > Create database and user"
	@psql -U postgres -a -f docs/init-db.txt

db-migration:
	@echo " > DB migrations"
	@echo " Main db"
	@psql -U test -d ta-sd-n-backend-main -a -f $(PROJ_MAIN_PATH)/migration/1584102611551-init.sql
	@echo " Auth db"
	@psql -U test -d ta-sd-n-backend-auth -a -f $(PROJ_AUTH_PATH)/migration/1584102611551-init.sql

set-up-default-configs:
	@echo " > Default configs"
	@echo " Auth server"
	@cp $(PROJ_AUTH_PATH)/config/example/*.json $(PROJ_AUTH_PATH)/config
	@echo " Main server"
	@cp $(PROJ_MAIN_PATH)/config/example/*.json $(PROJ_MAIN_PATH)/config


setup-temp:
	@echo " > setup temp"
	@-mkdir $(PROJ_TEMP_PATH)
	@echo "*" > $(PROJ_TEMP_PATH)/.gitignore

start-servers: stop-servers start-auth-server start-main-server

start-auth-server:
	@echo "  >  Starting auth server"
	@-node $(PROJ_AUTH_PATH)/app.js 2>$(STDOUT_AUTH) & echo $$! > $(PID_AUTH)
	@cat $(PID_AUTH) | sed "/^/s/^/  \>  PID: /"
	@echo "  >  stout at $(STDOUT_AUTH)"

start-main-server:
	@echo "  >  Starting main server"
	@-node $(PROJ_MAIN_PATH)/app.js 2>$(STDOUT_MAIN) & echo $$! > $(PID_MAIN)
	@cat $(PID_MAIN) | sed "/^/s/^/  \>  PID: /"
	@echo "  >  stout at $(STDOUT_MAIN)"

stop-servers: stop-auth-server stop-main-server

stop-auth-server:
	@echo "  >  Stopping auth server"
	@-touch $(PID_AUTH)
	@-kill `cat $(PID_AUTH)` 2> /dev/null || true
	@-rm $(PID_AUTH)

stop-main-server:
	@echo "  >  Stopping main server"
	@-touch $(PID_MAIN)
	@-kill `cat $(PID_MAIN)` 2> /dev/null || true
	@-rm $(PID_MAIN)

setup:
	@echo " > Setup project"
	@-$(MAKE) install create-db-user db-migration set-up-default-configs setup-temp
	@echo " DONE "

.PHONY: help
all: help
help: Makefile
	@echo
	@echo " Choose a command run in "$(PROJECT_NAME)":"
	@echo
	@sed -n 's/^##//p' $< | column -t -s ':' |  sed -e 's/^/ /'
	@echo


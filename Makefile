#                                                                              #
# Makefile                                                                     #
# mpuig-ma                                                                     #
# Thu 13 Jun 2024 11:27:58 AM CEST                                             #

# @SRC_DIR	Sets docker-related files directory.
#			If not set previouly, it defaults to `./docker' (NO ANYMORE)

SRC_DIR	:=	.

.PHONY: all up down clean fclean re purgedb purgeall debug

HOST=$(shell hostname)

ifneq (,$(findstring 42barcelona.com, $(HOST) ))
export HTTP_PORT=8000
export HTTPS_PORT=8443
endif

all: up

debug: crt.pem
	DEBUG=true docker compose -f $(SRC_DIR)/docker-compose.yml --env-file .env up --build

up: crt.pem
	docker compose -f $(SRC_DIR)/docker-compose.yml --env-file .env up --build --detach

crt.pem: key.pem
	openssl req -x509 -key $< -out $@ -subj "/C=ES/ST=Catalunya/O=PINGpongMOJOdojoCASAhouse/"

key.pem:
	openssl genrsa -out $@
		
down:
	docker compose -f $(SRC_DIR)/docker-compose.yml --env-file .env down

stop:
	docker compose -f $(SRC_DIR)/docker-compose.yml --env-file .env stop

clean:
	docker compose -f $(SRC_DIR)/docker-compose.yml --env-file .env down

fclean: purgeall clean

re: fclean up

purgedb:
	docker run --tty --rm --volume "$(shell pwd)":/ft postgres:16.4-alpine3.20 ash -c "rm -vrf /ft/postgres_data"

purgestatic:
	docker run --tty --rm --volume "$(shell pwd)":/ft node:22.7-alpine3.19 ash -c "rm -vrf /ft/static"

purgenodemodules:
	docker run --tty --rm --volume "$(shell pwd)":/ft node:22.7-alpine3.19 ash -c "rm -vrf /ft/node_modules"

purgeall: purgestatic purgenodemodules
	docker run --tty --rm --volume "$(shell pwd)":/ft node:22.7-alpine3.19 ash -c "rm -vrf /ft/node_modules /ft/static"

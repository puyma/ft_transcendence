#                                                                              #
# Makefile                                                                     #
# mpuig-ma                                                                     #
# Thu 13 Jun 2024 11:27:58 AM CEST                                             #

# @SRC_DIR	Sets docker-related files directory.
#			If not set previouly, it defaults to `./docker' (NO ANYMORE)

SRC_DIR	:=	.

.PHONY: all up down clean fclean re purgedb debug

# https://serverfault.com/questions/1108735/how-to-allow-a-docker-container-to-bind-a-privileged-port-as-another-user
# sysctl:
#   net.ipv4.ip_unprivileged_port_start: 0

HOST=$(shell hostname)

ifneq (,$(findstring 42barcelona.co.comm, $(HOST) ))
export HTTP_PORT=8000
export HTTPS_PORT=8443
endif

all: up

debug:
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

fclean: clean
	rm -rf node_modules
	rm -rf static

re: fclean up

purgedb:
	docker run --tty --rm --volume "$(shell pwd)":/ft postgres:alpine ash -c "rm -vr /ft/postgres_data"

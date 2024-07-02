#                                                                              #
# Makefile                                                                     #
# mpuig-ma                                                                     #
# Thu 13 Jun 2024 11:27:58 AM CEST                                             #

# @SRC_DIR	Sets docker-related files directory.
#			If not set previouly, it defaults to `./docker'.

SRC_DIR		?=	./docker

.PHONY: all up clean fclean re purgedb

all: up

$(SRC_DIR)/database/data:
	mkdir -p "$@"

up: | $(SRC_DIR)/database/data
	docker compose \
		-f $(SRC_DIR)/docker-compose.yml \
		--env-file .env \
		up --build --detach
		
clean:
	docker compose -f $(SRC_DIR)/docker-compose.yml --env-file .env down

fclean: clean
	docker compose -f $(SRC_DIR)/docker-compose.yml --env-file .env down --volumes

re: fclean up

purgedb:
	docker run --tty --rm --mount type=bind,src=./docker/database,dst=/ft postgres:alpine ash -c "rm -vr /ft/data"

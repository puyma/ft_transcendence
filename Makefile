#
#
#

SRC_DIR		?=	./docker

.PHONY: all up clean fclean re

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

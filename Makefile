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
		up --build --detach
		
clean:
	docker compose -f $(SRC_DIR)/docker-compose.yml down

fclean: clean
	docker compose -f $(SRC_DIR)/docker-compose.yml down --volumes

re: fclean up

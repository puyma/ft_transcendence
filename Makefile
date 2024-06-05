#
#
#

.PHONY: all up clean fclean re

all: up

up: data
	docker compose -f src/docker-compose.yml up --build --detach

data:
	mkdir ./data

clean:
	docker compose -f src/docker-compose.yml down

fclean: clean

re: fclean up

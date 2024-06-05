#
#
#

.PHONY: all up clean fclean re

all: up

up:
	docker compose -f src/docker-compose.yml up --build --detach

clean:
	docker compose -f src/docker-compose.yml down

fclean: clean

re: fclean up

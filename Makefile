#
#
#

.PHONY: all up clean fclean re

all: up

up: data
	docker compose -f srcs/docker-compose.yml up --build

data:
	mkdir ./data

clean:
	docker compose -f srcs/docker-compose.yml down

fclean: clean

re: fclean up

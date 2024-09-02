#                                                                              #
# Makefile                                                                     #
# mpuig-ma                                                                     #
# Thu 13 Jun 2024 11:27:58 AM CEST                                             #

# @SRC_DIR	Sets docker-related files directory.
#			If not set previouly, it defaults to `./docker' (NO ANYMORE)

SRC_DIR	:=	.

.PHONY: all up clean fclean re purgedb

all: up

up:
	docker compose -f $(SRC_DIR)/docker-compose.yml --env-file .env up --build --detach
		
clean:
	docker compose -f $(SRC_DIR)/docker-compose.yml --env-file .env down

fclean: clean
	rm -rf node_modules

re: fclean up

purgedb:
	docker run --tty --rm --volume "$(shell pwd)":/ft postgres:alpine ash -c "rm -vr /ft/postgres_data"

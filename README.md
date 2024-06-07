# TODO

- [ ] Solve database data directory (./data/pgdata) permissions.
The postgres startup script sets them (chown) to a user postgres that only exists inside the container and does not map with the host system.

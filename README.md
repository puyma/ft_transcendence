To configure the database, postgres's default environment variables
must be set. Add them in a file called ".env".

```
POSTGRES_PASSWORD=
POSTGRES_USER=
POSTGRES_DB=
```

# TODO

- [ ] Solve database data directory (./data/pgdata) permissions.
The postgres startup script sets them (chown) to a user postgres that only exists inside the container and does not map with the host system.

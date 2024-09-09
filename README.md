To configure the database, postgres's default environment variables
must be set.

Add them in a file called ".env".

```
DB_NAME=
DB_USER=
DB_PASSWORD=
```

To enable 42.fr API also add these to ".env".

```
42_API_UID=
42_API_SECRET=
```

In order to fully erase database's contents (if postgres's user is not mapped on your system) `make purgedb` can be run.

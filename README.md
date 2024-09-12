# Configuration

To configure the database, postgres's default environment variables
must be set.

Add them in a file called ".env".

```
DB_NAME=
DB_USER=
DB_PASSWORD=
```

Also add these. DOMAIN_URL consists of scheme + domain + port
```
DOMAIN=
DOMAIN_URL=
```

To enable 42.fr API also add these to ".env".

```
API_42_UID=
API_42_SECRET=
```

For 42's API to work it is necessary to add the DOMAIN_URL + route to oauth callback (oauth/callback/) in the field "Redirect URI" in your 42 application (V2).

In order to fully erase database's contents (if postgres's user is not mapped on your system) `make purgedb` can be run.

# Conventions

## Commit messages

Commit messages should be as follows:

- `- | <commit>` : Deleted something
- `~ | <commit>` : Modified something
- `+ | <commit>` : Added something

<!--

## Code formatters

- ECMAScript: Prettier
- Python: Black

-->

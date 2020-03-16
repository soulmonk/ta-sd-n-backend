# ta-sd-n-backend

### Setup

- with make file:
    - `make setup` - install dependency, db, configurations
    - `make start-servers` - start both auth and main servers
    - `make stop-servers` - stop both servers

### DB

- Create user and database example in [init-db.sql](docs/init-db.sql)
- Migration per project in `migration` folder (e.g. [main/init.sql](main/migration/1584102611551-init.sql))

```bash
psql -U test -d ta-sd-n-backend-auth -a -f auth/migration/1584102611551-init.sql
```

#### Auth

From project root:

```bash
cd auth
npm i
cp config/exmaple/*json config/
```

#### Main

From project root:

```bash
cd main
npm i
cp config/exmaple/*json config/
```

### Npm commands per project

- npm start - start a server
- npm test - run all tests

#### **pg.json**:
```json
{
  "user": "test",
  "host": "localhost",
  "database": "ta-sd-n-backend-auth",
  "password": "toor",
  "port": 5432
}
```

---

#### **jwt.json**:
```json
{
  "secret": "secret_key",
  "expiresIn": 900
}
```

Note: `expiresIn`, `refreshExpiresIn` in seconds

---

#### **user.json**:
```json
{
  "rounds": 10
}
```

rounds - bcrypt: the cost of processing the data

---

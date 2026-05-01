import psycopg2
import os
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    db_url = os.getenv("DATABASE_URL_ROOT", "postgresql://postgres:postgres@localhost:5432/postgres")
    conn = psycopg2.connect(db_url)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    try:
        cur.execute('CREATE DATABASE taskmanager')
        print("Database taskmanager created successfully.")
    except psycopg2.errors.DuplicateDatabase:
        print("Database already exists.")
    finally:
        cur.close()
        conn.close()
except Exception as e:
    print(f"Error connecting: {e}")

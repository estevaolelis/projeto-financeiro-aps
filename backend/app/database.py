from contextlib import contextmanager
from typing import Iterator
from urllib.parse import unquote, urlparse

import mysql.connector
from mysql.connector import MySQLConnection

from app.config import settings


def _connection_config() -> dict[str, object]:
    parsed_url = urlparse(settings.database_url)
    return {
        "host": parsed_url.hostname or "localhost",
        "port": parsed_url.port or 3306,
        "user": unquote(parsed_url.username or ""),
        "password": unquote(parsed_url.password or ""),
        "database": parsed_url.path.lstrip("/"),
    }


@contextmanager
def get_connection() -> Iterator[MySQLConnection]:
    connection = mysql.connector.connect(**_connection_config())
    try:
        yield connection
    finally:
        connection.close()

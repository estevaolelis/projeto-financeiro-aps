from contextlib import contextmanager
from typing import Iterator
from urllib.parse import unquote, urlparse

import mysql.connector
from mysql.connector import MySQLConnection

from app.config import configuracoes


def _configuracao_conexao() -> dict[str, object]:
    url_analisada = urlparse(configuracoes.url_banco_dados)
    return {
        "host": url_analisada.hostname or "localhost",
        "port": url_analisada.port or 3306,
        "user": unquote(url_analisada.username or ""),
        "password": unquote(url_analisada.password or ""),
        "database": url_analisada.path.lstrip("/"),
    }


@contextmanager
def obter_conexao() -> Iterator[MySQLConnection]:
    conexao = mysql.connector.connect(**_configuracao_conexao())
    try:
        yield conexao
    finally:
        conexao.close()

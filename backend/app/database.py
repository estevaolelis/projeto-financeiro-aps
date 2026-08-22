from typing import Optional


class Database:
    def __init__(self):
        self.connection: Optional[str] = None

    def connect(self):
        self.connection = "database_connection_placeholder"
        return self.connection

    def disconnect(self):
        self.connection = None


database = Database()

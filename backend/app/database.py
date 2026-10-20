"""
Database connection module using SQLAlchemy 2.0 Core only.
No ORM models and no declarative Base. Uses ODBC Driver 18 + pyodbc for Azure SQL.
"""

from sqlalchemy import create_engine, text
from app.config import settings

# Create SQLAlchemy 2.0 Core engine
engine = create_engine(
    settings.azure_sql_connection_string,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)


def check_db_connection() -> tuple[bool, str]:
    """
    Tests the database connection using SQLAlchemy 2.0 Core text() construct.
    Returns (is_connected, status_message).
    """
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            row = result.fetchone()
            if row and row[0] == 1:
                return True, "Connected successfully"
        return False, "Connection test query returned unexpected result"
    except Exception as e:
        # Do not generate fake successful connections; report the actual connection state.
        error_msg = str(e).split("\n")[0]
        return False, f"Disconnected / Not Configured ({error_msg})"

"""Add idempotency_keys table for tenant-scoped idempotency tracking

Revision ID: 003_add_idempotency_table
Revises: 002_add_runs_table
Create Date: 2026-10-20 01:35:00.000000

"""
from typing import Sequence, Union
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '003_add_idempotency_table'
down_revision: Union[str, None] = '002_add_runs_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='idempotency_keys' and xtype='U')
        CREATE TABLE idempotency_keys (
            id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
            tenant_id UNIQUEIDENTIFIER NOT NULL,
            idempotency_key NVARCHAR(255) NOT NULL,
            input_hash NVARCHAR(64) NOT NULL,
            run_id UNIQUEIDENTIFIER NOT NULL,
            created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
            FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
            FOREIGN KEY (run_id) REFERENCES runs(run_id),
            CONSTRAINT UQ_tenant_idempotency_key UNIQUE (tenant_id, idempotency_key)
        );
    """)

    op.execute("""
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_idempotency_tenant_key')
        CREATE INDEX IX_idempotency_tenant_key ON idempotency_keys(tenant_id, idempotency_key);
    """)


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS IX_idempotency_tenant_key ON idempotency_keys;")
    op.execute("DROP TABLE IF EXISTS idempotency_keys;")

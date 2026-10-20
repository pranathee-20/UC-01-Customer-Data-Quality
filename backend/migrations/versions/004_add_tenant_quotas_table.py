"""Add tenant_quotas table for atomic daily quota enforcement

Revision ID: 004_add_tenant_quotas_table
Revises: 003_add_idempotency_table
Create Date: 2026-10-20 01:42:00.000000

"""
from typing import Sequence, Union
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '004_add_tenant_quotas_table'
down_revision: Union[str, None] = '003_add_idempotency_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tenant_quotas' and xtype='U')
        CREATE TABLE tenant_quotas (
            id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
            tenant_id UNIQUEIDENTIFIER NOT NULL,
            quota_date DATE NOT NULL,
            used_count INT NOT NULL DEFAULT 0,
            limit_count INT NOT NULL DEFAULT 100,
            FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
            CONSTRAINT UQ_tenant_quota_date UNIQUE (tenant_id, quota_date)
        );
    """)

    op.execute("""
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_tenant_quotas_date')
        CREATE INDEX IX_tenant_quotas_date ON tenant_quotas(tenant_id, quota_date);
    """)


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS IX_tenant_quotas_date ON tenant_quotas;")
    op.execute("DROP TABLE IF EXISTS tenant_quotas;")

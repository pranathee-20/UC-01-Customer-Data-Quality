"""Add runs table for Module 2 batch validation runs

Revision ID: 002_add_runs_table
Revises: 001_initial_foundation
Create Date: 2026-10-20 01:25:00.000000

"""
from typing import Sequence, Union
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '002_add_runs_table'
down_revision: Union[str, None] = '001_initial_foundation'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='runs' and xtype='U')
        CREATE TABLE runs (
            run_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
            tenant_id UNIQUEIDENTIFIER NOT NULL,
            operator_email NVARCHAR(255) NOT NULL,
            status NVARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
            record_count INT NOT NULL DEFAULT 0,
            quality_score_avg FLOAT NOT NULL DEFAULT 100.0,
            result_summary NVARCHAR(MAX),
            created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
            FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
        );
    """)

    op.execute("""
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_runs_tenant_id')
        CREATE INDEX IX_runs_tenant_id ON runs(tenant_id);
    """)


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS IX_runs_tenant_id ON runs;")
    op.execute("DROP TABLE IF EXISTS runs;")

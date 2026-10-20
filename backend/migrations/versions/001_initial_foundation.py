"""Initial foundation tables using explicit SQL via op.execute

Revision ID: 001_initial_foundation
Revises: 
Create Date: 2026-10-20 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '001_initial_foundation'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use explicit SQL via op.execute as requested
    op.execute("""
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='tenants' and xtype='U')
        CREATE TABLE tenants (
            tenant_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
            name NVARCHAR(255) NOT NULL,
            plan NVARCHAR(50) NOT NULL DEFAULT 'Pro',
            created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
        );
    """)

    op.execute("""
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='customer_records' and xtype='U')
        CREATE TABLE customer_records (
            record_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
            tenant_id UNIQUEIDENTIFIER NOT NULL,
            customer_name NVARCHAR(255) NOT NULL,
            email NVARCHAR(255) NOT NULL,
            phone NVARCHAR(50),
            company NVARCHAR(255),
            country NVARCHAR(100),
            validation_status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
            created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
            FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
        );
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS customer_records;")
    op.execute("DROP TABLE IF EXISTS tenants;")

"""Add subscription_status column to tenants table

Revision ID: 005_add_tenant_subscription_status
Revises: 004_add_tenant_quotas_table
Create Date: 2026-10-20 02:16:00.000000

"""
from typing import Sequence, Union
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '005_add_tenant_subscription_status'
down_revision: Union[str, None] = '004_add_tenant_quotas_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        IF NOT EXISTS (
            SELECT * FROM sys.columns 
            WHERE object_id = OBJECT_ID('tenants') AND name = 'subscription_status'
        )
        ALTER TABLE tenants ADD subscription_status NVARCHAR(50) NOT NULL DEFAULT 'active';
    """)


def downgrade() -> None:
    op.execute("""
        IF EXISTS (
            SELECT * FROM sys.columns 
            WHERE object_id = OBJECT_ID('tenants') AND name = 'subscription_status'
        )
        ALTER TABLE tenants DROP COLUMN subscription_status;
    """)

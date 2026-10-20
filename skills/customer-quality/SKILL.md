---
name: customer-quality
description: Domain knowledge and operational guidelines for UC-01 Customer Data Quality SaaS.
---

# Customer Data Quality SaaS (UC-01)

## Architecture Overview
- **Frontend**: React + TypeScript + Vite. Communicates with backend via `VITE_API_BASE_URL`.
- **Backend**: Python 3.12 + FastAPI + Uvicorn.
- **Database**: Microsoft Azure SQL Database accessed exclusively via SQLAlchemy 2.0 Core and Microsoft ODBC Driver 18 + pyodbc. No ORM models or declarative Base are used.
- **Migrations**: Alembic with explicit SQL statements executed via `op.execute()`. Autogenerate is disabled.
- **Authentication**: JWT tokens containing tenant claims and role authorizations.
- **Storage**: Private Azure Blob Storage for raw and processed customer record batches.
- **Infrastructure**: Terraform provisioning for Azure Container Apps, Azure SQL Database, and Azure Blob Storage.

## Operational Standards
1. Never hardcode credentials; always use typed configuration (`pydantic-settings`).
2. Do not generate fake successful database connections; report actual ODBC connection state.
3. Maintain test coverage via pytest for HTTP routes and concurrency.

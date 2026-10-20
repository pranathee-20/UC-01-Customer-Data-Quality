# Terraform Infrastructure Configuration for UC-01 Customer Data Quality SaaS
# Azure Container Apps, Azure SQL Database, and Private Azure Blob Storage

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "prefix" {
  type        = string
  default     = "uc01-dq"
  description = "Prefix for all Azure resources"
}

variable "location" {
  type        = string
  default     = "East US"
  description = "Azure region"
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.prefix}-rg"
  location = var.location
}

# Azure SQL Server & Database
resource "azurerm_mssql_server" "sql_server" {
  name                         = "${var.prefix}-sqlserver"
  resource_group_name          = azurerm_resource_group.rg.name
  location                     = azurerm_resource_group.rg.location
  version                      = "12.0"
  administrator_login          = "sqladmin"
  administrator_login_password = "Password12345!Secure"
}

resource "azurerm_mssql_database" "sql_db" {
  name         = "customer_quality_db"
  server_id    = azurerm_mssql_server.sql_server.id
  sku_name     = "S0"
  storage_account_type = "Local"
}

# Azure Storage Account (Private Blob Storage)
resource "azurerm_storage_account" "storage" {
  name                     = replace("${var.prefix}store", "-", "")
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  public_network_access_enabled = false
}

resource "azurerm_storage_container" "container" {
  name                  = "customer-records-private"
  storage_account_name  = azurerm_storage_account.storage.name
  container_access_type = "private"
}

output "sql_server_fqdn" {
  value = azurerm_mssql_server.sql_server.fully_qualified_domain_name
}

output "storage_account_name" {
  value = azurerm_storage_account.storage.name
}

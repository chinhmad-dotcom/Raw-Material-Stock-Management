-- =========================================================================
-- StockRM Database Schema (SQL Server)
-- =========================================================================

CREATE DATABASE StockRM_DB;
GO

USE StockRM_DB;
GO

-- 1. Users Table
CREATE TABLE [Users] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Username] NVARCHAR(100) NOT NULL,
    [PasswordHash] NVARCHAR(255) NOT NULL,
    [FullName] NVARCHAR(200) NOT NULL,
    [Email] NVARCHAR(200) NOT NULL,
    [PhoneNumber] NVARCHAR(20) NULL,
    [Role] INT NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [LastLoginAt] DATETIME2 NULL,
    [RefreshToken] NVARCHAR(500) NULL,
    [RefreshTokenExpiresAt] DATETIME2 NULL,
    
    -- BaseEntity properties
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL,
    [CreatedBy] NVARCHAR(MAX) NULL,
    [UpdatedBy] NVARCHAR(MAX) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);
GO
CREATE UNIQUE INDEX [IX_Users_Username] ON [Users] ([Username]) WHERE [IsDeleted] = 0;
GO
CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]) WHERE [IsDeleted] = 0;
GO

-- 2. Materials Table
CREATE TABLE [Materials] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Code] NVARCHAR(20) NOT NULL,
    [Name] NVARCHAR(150) NOT NULL,
    [NameVi] NVARCHAR(150) NOT NULL,
    [Type] INT NOT NULL, -- 1 = Silo, 2 = Additive
    [Unit] NVARCHAR(20) NOT NULL,
    [Description] NVARCHAR(500) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    
    -- BaseEntity properties
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL,
    [CreatedBy] NVARCHAR(MAX) NULL,
    [UpdatedBy] NVARCHAR(MAX) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT [PK_Materials] PRIMARY KEY ([Id])
);
GO
CREATE UNIQUE INDEX [IX_Materials_Code] ON [Materials] ([Code]) WHERE [IsDeleted] = 0;
GO

-- 3. AgeStandards Table
CREATE TABLE [AgeStandards] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [MaterialId] INT NOT NULL,
    [MaxStorageAgeDays] INT NOT NULL,
    [WarningThresholdPercent] INT NOT NULL DEFAULT 80,
    [Notes] NVARCHAR(500) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    
    -- BaseEntity properties
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL,
    [CreatedBy] NVARCHAR(MAX) NULL,
    [UpdatedBy] NVARCHAR(MAX) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT [PK_AgeStandards] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AgeStandards_Materials_MaterialId] FOREIGN KEY ([MaterialId]) REFERENCES [Materials] ([Id]) ON DELETE CASCADE
);
GO
CREATE UNIQUE INDEX [IX_AgeStandards_MaterialId] ON [AgeStandards] ([MaterialId]) WHERE [IsDeleted] = 0;
GO

-- 4. Silos Table
CREATE TABLE [Silos] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Code] NVARCHAR(20) NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    [CapacityTons] DECIMAL(18,4) NOT NULL,
    [Location] NVARCHAR(200) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    
    -- BaseEntity properties
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL,
    [CreatedBy] NVARCHAR(MAX) NULL,
    [UpdatedBy] NVARCHAR(MAX) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT [PK_Silos] PRIMARY KEY ([Id])
);
GO
CREATE UNIQUE INDEX [IX_Silos_Code] ON [Silos] ([Code]) WHERE [IsDeleted] = 0;
GO

-- 5. SiloStocks Table
CREATE TABLE [SiloStocks] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [SiloId] INT NOT NULL,
    [MaterialId] INT NOT NULL,
    [ReceiptDate] DATETIME2 NOT NULL,
    
    -- Quantities and status
    [OpeningStockTons] DECIMAL(18,4) NOT NULL,
    [IntakeTons] DECIMAL(18,4) NOT NULL,
    [DispatchTons] DECIMAL(18,4) NOT NULL,
    [ClosingStockTons] DECIMAL(18,4) NOT NULL,
    [AverageDailyConsumptionTons] DECIMAL(18,4) NOT NULL,
    [StockDate] DATETIME2 NOT NULL,
    
    -- Metadata
    [BatchNumber] NVARCHAR(100) NULL,
    [SupplierName] NVARCHAR(200) NULL,
    [Notes] NVARCHAR(500) NULL,
    
    -- Calculations and Alerts
    [DayOnHand] DECIMAL(18,4) NOT NULL,
    [AgeInDays] INT NOT NULL,
    [IsLowStockAlert] BIT NOT NULL,
    [IsCriticalAgeAlert] BIT NOT NULL,
    
    -- BaseEntity properties
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL,
    [CreatedBy] NVARCHAR(MAX) NULL,
    [UpdatedBy] NVARCHAR(MAX) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT [PK_SiloStocks] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_SiloStocks_Silos_SiloId] FOREIGN KEY ([SiloId]) REFERENCES [Silos] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_SiloStocks_Materials_MaterialId] FOREIGN KEY ([MaterialId]) REFERENCES [Materials] ([Id]) ON DELETE NO ACTION
);
GO
CREATE INDEX [IX_SiloStocks_StockDate] ON [SiloStocks] ([StockDate]);
GO
CREATE INDEX [IX_SiloStocks_SiloId_MaterialId_StockDate] ON [SiloStocks] ([SiloId], [MaterialId], [StockDate]);
GO
CREATE INDEX [IX_SiloStocks_IsLowStockAlert] ON [SiloStocks] ([IsLowStockAlert]);
GO
CREATE INDEX [IX_SiloStocks_IsCriticalAgeAlert] ON [SiloStocks] ([IsCriticalAgeAlert]);
GO

-- 6. AdditiveStocks Table
CREATE TABLE [AdditiveStocks] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [MaterialId] INT NOT NULL,
    [ReceiptDate] DATETIME2 NOT NULL,
    
    -- Quantities and status
    [OpeningStockTons] DECIMAL(18,4) NOT NULL,
    [ReceiptTons] DECIMAL(18,4) NOT NULL,
    [IssueTons] DECIMAL(18,4) NOT NULL,
    [ClosingStockTons] DECIMAL(18,4) NOT NULL,
    [AverageDailyConsumptionTons] DECIMAL(18,4) NOT NULL,
    [StockDate] DATETIME2 NOT NULL,
    
    -- Metadata
    [BatchNumber] NVARCHAR(100) NULL,
    [SupplierName] NVARCHAR(200) NULL,
    [InvoiceNumber] NVARCHAR(100) NULL,
    [WarehouseLocation] NVARCHAR(200) NULL,
    [Notes] NVARCHAR(500) NULL,
    
    -- Calculations and Alerts
    [DayOnHand] DECIMAL(18,4) NOT NULL,
    [AgeInDays] INT NOT NULL,
    [IsLowStockAlert] BIT NOT NULL,
    [IsCriticalAgeAlert] BIT NOT NULL,
    
    -- BaseEntity properties
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL,
    [CreatedBy] NVARCHAR(MAX) NULL,
    [UpdatedBy] NVARCHAR(MAX) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT [PK_AdditiveStocks] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AdditiveStocks_Materials_MaterialId] FOREIGN KEY ([MaterialId]) REFERENCES [Materials] ([Id]) ON DELETE NO ACTION
);
GO
CREATE INDEX [IX_AdditiveStocks_StockDate] ON [AdditiveStocks] ([StockDate]);
GO
CREATE INDEX [IX_AdditiveStocks_MaterialId_StockDate] ON [AdditiveStocks] ([MaterialId], [StockDate]);
GO
CREATE INDEX [IX_AdditiveStocks_IsLowStockAlert] ON [AdditiveStocks] ([IsLowStockAlert]);
GO
CREATE INDEX [IX_AdditiveStocks_IsCriticalAgeAlert] ON [AdditiveStocks] ([IsCriticalAgeAlert]);
GO

-- 7. StockTransactions Table
CREATE TABLE [StockTransactions] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [MaterialId] INT NOT NULL,
    [SiloId] INT NULL,
    [TransactionType] INT NOT NULL, -- 1 = Intake, 2 = Dispatch, 3 = StockTake, 4 = Adjustment, etc.
    [QuantityTons] DECIMAL(18,4) NOT NULL,
    [TransactionDate] DATETIME2 NOT NULL,
    [BatchNumber] NVARCHAR(100) NULL,
    [SupplierName] NVARCHAR(200) NULL,
    [ReferenceNumber] NVARCHAR(100) NULL, -- PO / Invoice / Dispatch note
    [Notes] NVARCHAR(500) NULL,
    [ImportedFromFile] NVARCHAR(255) NULL,
    [UserId] INT NOT NULL,
    
    -- Snapshot audit values
    [StockBeforeTons] DECIMAL(18,4) NOT NULL,
    [StockAfterTons] DECIMAL(18,4) NOT NULL,
    
    -- BaseEntity properties
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL,
    [CreatedBy] NVARCHAR(MAX) NULL,
    [UpdatedBy] NVARCHAR(MAX) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT [PK_StockTransactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_StockTransactions_Materials_MaterialId] FOREIGN KEY ([MaterialId]) REFERENCES [Materials] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_StockTransactions_Silos_SiloId] FOREIGN KEY ([SiloId]) REFERENCES [Silos] ([Id]) ON DELETE NO ACTION,
    CONSTRAINT [FK_StockTransactions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO
CREATE INDEX [IX_StockTransactions_TransactionDate] ON [StockTransactions] ([TransactionDate]);
GO
CREATE INDEX [IX_StockTransactions_MaterialId_TransactionDate] ON [StockTransactions] ([MaterialId], [TransactionDate]);
GO

-- 8. Alerts Table
CREATE TABLE [Alerts] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [MaterialId] INT NOT NULL,
    [SiloId] INT NULL,
    [AlertType] INT NOT NULL, -- 1 = LowStock, 2 = CriticalAge, 3 = NearExpiry
    [Severity] INT NOT NULL,  -- 1 = Info, 2 = Warning, 3 = Critical
    [Message] NVARCHAR(500) NOT NULL,
    [CurrentValue] DECIMAL(18,4) NULL,
    [ThresholdValue] DECIMAL(18,4) NULL,
    [IsResolved] BIT NOT NULL DEFAULT 0,
    [ResolvedAt] DATETIME2 NULL,
    [AlertDate] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    
    -- BaseEntity properties
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL,
    [CreatedBy] NVARCHAR(MAX) NULL,
    [UpdatedBy] NVARCHAR(MAX) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT [PK_Alerts] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Alerts_Materials_MaterialId] FOREIGN KEY ([MaterialId]) REFERENCES [Materials] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Alerts_Silos_SiloId] FOREIGN KEY ([SiloId]) REFERENCES [Silos] ([Id]) ON DELETE NO ACTION
);
GO
CREATE INDEX [IX_Alerts_IsResolved] ON [Alerts] ([IsResolved]);
GO
CREATE INDEX [IX_Alerts_MaterialId_AlertType_IsResolved] ON [Alerts] ([MaterialId], [AlertType], [IsResolved]);
GO

-- 9. AuditLogs Table
CREATE TABLE [AuditLogs] (
    [Id] INT IDENTITY(1,1) NOT NULL,
    [UserId] INT NOT NULL,
    [Action] NVARCHAR(100) NOT NULL,
    [EntityName] NVARCHAR(100) NOT NULL,
    [EntityId] INT NULL,
    [OldValues] NVARCHAR(MAX) NULL,
    [NewValues] NVARCHAR(MAX) NULL,
    [IpAddress] NVARCHAR(50) NULL,
    [UserAgent] NVARCHAR(500) NULL,
    
    -- BaseEntity properties
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] DATETIME2 NULL,
    [CreatedBy] NVARCHAR(MAX) NULL,
    [UpdatedBy] NVARCHAR(MAX) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0,
    
    CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AuditLogs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO
CREATE INDEX [IX_AuditLogs_UserId_CreatedAt] ON [AuditLogs] ([UserId], [CreatedAt]);
GO
CREATE INDEX [IX_AuditLogs_EntityName_EntityId] ON [AuditLogs] ([EntityName], [EntityId]);
GO

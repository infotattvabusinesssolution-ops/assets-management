BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[maintenance_plans] (
    [id] NVARCHAR(36) NOT NULL,
    [planNumber] NVARCHAR(50) NOT NULL,
    [companyId] NVARCHAR(1000),
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [workType] NVARCHAR(1000) NOT NULL CONSTRAINT [maintenance_plans_workType_df] DEFAULT 'PREVENTIVE',
    [applyToRule] NVARCHAR(1000) NOT NULL CONSTRAINT [maintenance_plans_applyToRule_df] DEFAULT 'CATEGORY',
    [categoryId] NVARCHAR(1000),
    [siteId] NVARCHAR(1000),
    [custodianId] NVARCHAR(1000),
    [assetIdsJson] NVARCHAR(max),
    [frequencyMonths] INT NOT NULL CONSTRAINT [maintenance_plans_frequencyMonths_df] DEFAULT 6,
    [nextDueDate] DATETIME2 NOT NULL,
    [active] BIT NOT NULL CONSTRAINT [maintenance_plans_active_df] DEFAULT 1,
    [autoCreateWorkOrders] BIT NOT NULL CONSTRAINT [maintenance_plans_autoCreateWorkOrders_df] DEFAULT 0,
    [advanceDays] INT NOT NULL CONSTRAINT [maintenance_plans_advanceDays_df] DEFAULT 7,
    [createdByUserId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [maintenance_plans_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [maintenance_plans_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [maintenance_plans_planNumber_key] UNIQUE NONCLUSTERED ([planNumber])
);

-- CreateTable
CREATE TABLE [dbo].[maintenance_plan_checklist] (
    [id] NVARCHAR(36) NOT NULL,
    [planId] NVARCHAR(36) NOT NULL,
    [task] NVARCHAR(1000) NOT NULL,
    [sortOrder] INT NOT NULL CONSTRAINT [maintenance_plan_checklist_sortOrder_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [maintenance_plan_checklist_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [maintenance_plan_checklist_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[maintenance_plan_comments] (
    [id] NVARCHAR(36) NOT NULL,
    [planId] NVARCHAR(36) NOT NULL,
    [text] NVARCHAR(max) NOT NULL,
    [authorName] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [maintenance_plan_comments_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [maintenance_plan_comments_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[maintenance_plan_events] (
    [id] NVARCHAR(36) NOT NULL,
    [planId] NVARCHAR(36) NOT NULL,
    [action] NVARCHAR(1000) NOT NULL,
    [details] NVARCHAR(1000),
    [actorName] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [maintenance_plan_events_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [maintenance_plan_events_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[maintenance_plan_runs] (
    [id] NVARCHAR(36) NOT NULL,
    [planId] NVARCHAR(36) NOT NULL,
    [assetId] NVARCHAR(36) NOT NULL,
    [workOrderId] NVARCHAR(36) NOT NULL,
    [dueDate] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [maintenance_plan_runs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [maintenance_plan_runs_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [maintenance_plan_runs_planId_assetId_dueDate_key] UNIQUE NONCLUSTERED ([planId],[assetId],[dueDate])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [maintenance_plans_active_nextDueDate_idx] ON [dbo].[maintenance_plans]([active], [nextDueDate]);

-- AddForeignKey
ALTER TABLE [dbo].[maintenance_plan_checklist] ADD CONSTRAINT [maintenance_plan_checklist_planId_fkey] FOREIGN KEY ([planId]) REFERENCES [dbo].[maintenance_plans]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[maintenance_plan_comments] ADD CONSTRAINT [maintenance_plan_comments_planId_fkey] FOREIGN KEY ([planId]) REFERENCES [dbo].[maintenance_plans]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[maintenance_plan_events] ADD CONSTRAINT [maintenance_plan_events_planId_fkey] FOREIGN KEY ([planId]) REFERENCES [dbo].[maintenance_plans]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[maintenance_plan_runs] ADD CONSTRAINT [maintenance_plan_runs_planId_fkey] FOREIGN KEY ([planId]) REFERENCES [dbo].[maintenance_plans]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH


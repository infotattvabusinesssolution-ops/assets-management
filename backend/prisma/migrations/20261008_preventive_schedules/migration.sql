BEGIN TRY
  BEGIN TRAN;

  ALTER TABLE [dbo].[maintenance_schedules] ADD
    [description] NVARCHAR(1000) NULL,
    [workType] NVARCHAR(1000) NOT NULL CONSTRAINT [maintenance_schedules_workType_df] DEFAULT 'PREVENTIVE',
    [autoGenerateWorkOrders] BIT NOT NULL CONSTRAINT [maintenance_schedules_autoGenerateWorkOrders_df] DEFAULT 0,
    [advanceDays] INT NOT NULL CONSTRAINT [maintenance_schedules_advanceDays_df] DEFAULT 7,
    [checklistJson] NVARCHAR(max) NULL;

  CREATE TABLE [dbo].[maintenance_schedule_runs] (
    [id] NVARCHAR(36) NOT NULL,
    [scheduleId] NVARCHAR(36) NOT NULL,
    [workOrderId] NVARCHAR(36) NOT NULL,
    [dueDate] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [maintenance_schedule_runs_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [maintenance_schedule_runs_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [maintenance_schedule_runs_scheduleId_dueDate_key] UNIQUE NONCLUSTERED ([scheduleId], [dueDate])
  );

  COMMIT TRAN;
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0 ROLLBACK TRAN;
  THROW;
END CATCH;

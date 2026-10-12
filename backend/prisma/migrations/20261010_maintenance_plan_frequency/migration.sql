BEGIN TRY
BEGIN TRAN;

ALTER TABLE [dbo].[maintenance_plans]
ADD [frequencyUnit] NVARCHAR(1000) NOT NULL CONSTRAINT [maintenance_plans_frequencyUnit_df] DEFAULT 'MONTHS',
    [frequencyInterval] INT NOT NULL CONSTRAINT [maintenance_plans_frequencyInterval_df] DEFAULT 6;

EXEC sp_executesql N'UPDATE [dbo].[maintenance_plans] SET [frequencyInterval] = [frequencyMonths]';

COMMIT TRAN;
END TRY
BEGIN CATCH
IF @@TRANCOUNT > 0 ROLLBACK TRAN;
THROW;
END CATCH;

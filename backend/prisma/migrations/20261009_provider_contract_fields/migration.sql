ALTER TABLE [contracts] ADD [referenceNumber] NVARCHAR(1000);
ALTER TABLE [contracts] ADD [paymentTermsDays] INT;
ALTER TABLE [contracts] ADD [currency] NVARCHAR(10) NOT NULL CONSTRAINT [contracts_currency_df] DEFAULT N'AED';
ALTER TABLE [contracts] ADD [coverageNotes] NVARCHAR(1000);
ALTER TABLE [contracts] ADD [visitEntitlements] NVARCHAR(200);

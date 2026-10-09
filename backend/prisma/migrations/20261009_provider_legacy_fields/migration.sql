ALTER TABLE [service_providers] ADD [legacyDetails] NVARCHAR(MAX);
ALTER TABLE [provider_contacts] ADD [mobile] NVARCHAR(100);
ALTER TABLE [provider_addresses] ADD [postalCode] NVARCHAR(50);
ALTER TABLE [provider_documents] ADD [issueDate] DATETIME2;
ALTER TABLE [provider_documents] ADD [description] NVARCHAR(1000);
ALTER TABLE [provider_documents] ADD [fileSize] INT;

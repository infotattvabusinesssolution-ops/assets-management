BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[service_providers] (
    [id] NVARCHAR(36) NOT NULL,
    [providerCode] NVARCHAR(50) NOT NULL,
    [providerName] NVARCHAR(300) NOT NULL,
    [providerType] NVARCHAR(1000) NOT NULL CONSTRAINT [service_providers_providerType_df] DEFAULT 'SERVICE_PROVIDER',
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [service_providers_status_df] DEFAULT 'DRAFT',
    [companyRegistrationNo] NVARCHAR(100),
    [taxRegistrationNo] NVARCHAR(100),
    [website] NVARCHAR(500),
    [currency] NVARCHAR(10) NOT NULL CONSTRAINT [service_providers_currency_df] DEFAULT 'AED',
    [paymentTermsDays] INT NOT NULL CONSTRAINT [service_providers_paymentTermsDays_df] DEFAULT 30,
    [preferred] BIT NOT NULL CONSTRAINT [service_providers_preferred_df] DEFAULT 0,
    [leadTimeDays] INT NOT NULL CONSTRAINT [service_providers_leadTimeDays_df] DEFAULT 7,
    [rating] FLOAT(53),
    [remarks] NVARCHAR(max),
    [primaryContact] NVARCHAR(200),
    [email] NVARCHAR(200),
    [phone] NVARCHAR(100),
    [addressLine1] NVARCHAR(300),
    [addressLine2] NVARCHAR(300),
    [city] NVARCHAR(100),
    [state] NVARCHAR(100),
    [country] NVARCHAR(100),
    [companyId] NVARCHAR(36),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [service_providers_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [service_providers_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [service_providers_providerCode_key] UNIQUE NONCLUSTERED ([providerCode])
);

-- CreateTable
CREATE TABLE [dbo].[provider_categories] (
    [id] NVARCHAR(36) NOT NULL,
    [providerId] NVARCHAR(36) NOT NULL,
    [categoryId] NVARCHAR(36) NOT NULL,
    [serviceType] NVARCHAR(1000) NOT NULL CONSTRAINT [provider_categories_serviceType_df] DEFAULT 'PREVENTIVE',
    [coverageSiteId] NVARCHAR(36),
    [description] NVARCHAR(1000),
    [active] BIT NOT NULL CONSTRAINT [provider_categories_active_df] DEFAULT 1,
    CONSTRAINT [provider_categories_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[provider_contacts] (
    [id] NVARCHAR(36) NOT NULL,
    [providerId] NVARCHAR(36) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [designation] NVARCHAR(200),
    [email] NVARCHAR(200),
    [phone] NVARCHAR(100),
    [isPrimary] BIT NOT NULL CONSTRAINT [provider_contacts_isPrimary_df] DEFAULT 0,
    CONSTRAINT [provider_contacts_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[provider_addresses] (
    [id] NVARCHAR(36) NOT NULL,
    [providerId] NVARCHAR(36) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL CONSTRAINT [provider_addresses_type_df] DEFAULT 'HEAD_OFFICE',
    [line1] NVARCHAR(300) NOT NULL,
    [line2] NVARCHAR(300),
    [city] NVARCHAR(100),
    [state] NVARCHAR(100),
    [country] NVARCHAR(100),
    CONSTRAINT [provider_addresses_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[provider_services] (
    [id] NVARCHAR(36) NOT NULL,
    [providerId] NVARCHAR(36) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [serviceCode] NVARCHAR(100) NOT NULL,
    [responseHours] INT,
    [rate] DECIMAL(18,2),
    [active] BIT NOT NULL CONSTRAINT [provider_services_active_df] DEFAULT 1,
    CONSTRAINT [provider_services_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [provider_services_providerId_serviceCode_key] UNIQUE NONCLUSTERED ([providerId],[serviceCode])
);

-- CreateTable
CREATE TABLE [dbo].[provider_certifications] (
    [id] NVARCHAR(36) NOT NULL,
    [providerId] NVARCHAR(36) NOT NULL,
    [name] NVARCHAR(200) NOT NULL,
    [certificateNumber] NVARCHAR(100),
    [issuingAuthority] NVARCHAR(200),
    [validUntil] DATETIME2,
    CONSTRAINT [provider_certifications_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[provider_documents] (
    [id] NVARCHAR(36) NOT NULL,
    [providerId] NVARCHAR(36) NOT NULL,
    [name] NVARCHAR(300) NOT NULL,
    [type] NVARCHAR(100) NOT NULL,
    [referenceNumber] NVARCHAR(100),
    [validUntil] DATETIME2,
    [storageUrl] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [provider_documents_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [provider_documents_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[provider_notes] (
    [id] NVARCHAR(36) NOT NULL,
    [providerId] NVARCHAR(36) NOT NULL,
    [text] NVARCHAR(max) NOT NULL,
    [authorName] NVARCHAR(200) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [provider_notes_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [provider_notes_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[provider_categories] ADD CONSTRAINT [provider_categories_providerId_fkey] FOREIGN KEY ([providerId]) REFERENCES [dbo].[service_providers]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[provider_contacts] ADD CONSTRAINT [provider_contacts_providerId_fkey] FOREIGN KEY ([providerId]) REFERENCES [dbo].[service_providers]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[provider_addresses] ADD CONSTRAINT [provider_addresses_providerId_fkey] FOREIGN KEY ([providerId]) REFERENCES [dbo].[service_providers]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[provider_services] ADD CONSTRAINT [provider_services_providerId_fkey] FOREIGN KEY ([providerId]) REFERENCES [dbo].[service_providers]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[provider_certifications] ADD CONSTRAINT [provider_certifications_providerId_fkey] FOREIGN KEY ([providerId]) REFERENCES [dbo].[service_providers]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[provider_documents] ADD CONSTRAINT [provider_documents_providerId_fkey] FOREIGN KEY ([providerId]) REFERENCES [dbo].[service_providers]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[provider_notes] ADD CONSTRAINT [provider_notes_providerId_fkey] FOREIGN KEY ([providerId]) REFERENCES [dbo].[service_providers]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH


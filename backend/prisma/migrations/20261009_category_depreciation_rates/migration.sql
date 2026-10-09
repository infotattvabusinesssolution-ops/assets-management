ALTER TABLE [categories] ADD [annualDepreciationRatePercent] DECIMAL(5,2) NULL;
ALTER TABLE [asset_book_values] ADD [annualDepreciationRatePercent] DECIMAL(5,2) NULL;

EXEC(N'UPDATE [categories]
SET [annualDepreciationRatePercent] = CASE
  WHEN LOWER([name]) LIKE ''%laptop%'' OR LOWER([name]) LIKE ''%notebook%'' THEN 5.00
  WHEN LOWER([name]) LIKE ''%mobile%'' OR LOWER([name]) LIKE ''%phone%'' OR LOWER([name]) LIKE ''%tablet%''
    OR LOWER([name]) LIKE ''%vehicle%'' THEN 20.00
  ELSE 10.00
END
WHERE [annualDepreciationRatePercent] IS NULL;

UPDATE [categories]
SET [defaultUsefulLifeMonths] = ROUND(1200.0 / [annualDepreciationRatePercent], 0)
WHERE [annualDepreciationRatePercent] IS NOT NULL;');

import { randomUUID } from 'node:crypto';

const filled = value => String(value ?? '').trim();
const prefix = value => {
  const parts = filled(value).toUpperCase().match(/[A-Z0-9]+/g) || [];
  return (parts.length > 1 ? parts.map(part => part[0]).join('') : parts[0] || 'GEN').slice(0, 5);
};

export const generatedImportAssetId = row => [
  prefix(row.assetType), prefix(row.category), prefix(row.subcategory),
  new Date().getUTCFullYear(), randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()
].join('-');

export function expandBulkAssetRows(rows) {
  return rows.flatMap((row, index) => {
    const quantity = filled(row.quantity) ? Number(row.quantity) : 1;
    const serials = filled(row.serialNumbers).split(/[;\n|]/).map(filled).filter(Boolean);
    const sourceRow = row.row || index + 2;
    const fail = message => [{ ...row, row: sourceRow, batchExpansionError: message }];
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) return fail('Quantity must be a whole number from 1 to 50.');
    if (quantity === 1) {
      if (serials.length > 1) return fail('Quantity 1 accepts only one serial number.');
      if (serials.length && filled(row.serialNumber) && filled(row.serialNumber) !== serials[0]) return fail('Serial Number and Serial Numbers disagree.');
      return [{ ...row, row: sourceRow, quantity: 1, serialNumber: filled(row.serialNumber) || serials[0] || '' }];
    }
    if (filled(row.assetId)) return fail('Leave Asset ID blank when Quantity is greater than 1; each asset gets a unique ID.');
    if (filled(row.serialNumber)) return fail('Use Serial Numbers for a multi-quantity row and leave Serial Number blank.');
    if (serials.length !== quantity || new Set(serials.map(serial => serial.toUpperCase())).size !== quantity) {
      return fail(`Quantity ${quantity} needs ${quantity} different serial numbers separated by semicolons in Serial Numbers.`);
    }
    if (['assetTagBarcode', 'rfidEpc', 'tid', 'discoveryId', 'hostname', 'ipAddress', 'macAddress'].some(key => filled(row[key]))) {
      return fail('For different tags or network details, use one Excel row per asset with Quantity 1.');
    }
    return serials.map((serialNumber, itemIndex) => ({
      ...row, row: sourceRow, quantity: 1, serialNumber, serialNumbers: '',
      assetId: generatedImportAssetId(row), batchItemNumber: itemIndex + 1, sourceQuantity: quantity
    }));
  });
}

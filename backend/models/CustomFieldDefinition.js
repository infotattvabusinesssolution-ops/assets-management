import mongoose from 'mongoose';

const customFieldDefinitionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  fieldType: { type: String, enum: ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT'], required: true },
  required: { type: Boolean, default: false },
  defaultValue: mongoose.Schema.Types.Mixed,
  options: [{ type: String }],
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const CustomFieldDefinition = mongoose.model('CustomFieldDefinition', customFieldDefinitionSchema);

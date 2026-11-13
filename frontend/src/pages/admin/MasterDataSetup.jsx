import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Layers,
  Tag,
  FolderTree,
  MapPin,
  Users,
  BarChart3,
  Truck,
  MoreHorizontal,
  Search,
  Filter,
  RotateCcw,
  Plus,
  Upload,
  Download,
  Edit,
  Eye,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Check,
  CheckCircle2,
  AlertTriangle,
  Factory,
  Scale,
  ShieldCheck,
  UserCheck,
  FileText,
  Wrench,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  History,
  BookOpen,
  Copy,
  RefreshCw,
  Clock,
  Grid,
  Building2,
  Settings
} from 'lucide-react';
import clsx from 'clsx';
import CodePrefixSettingsModal from '../../components/modals/CodePrefixSettingsModal';

// Modular Tab Components
import { ItemMasterTab } from '../../components/master-data/ItemMasterTab';
import { CompaniesTab } from '../../components/master-data/CompaniesTab';
import { CustodiansTab } from '../../components/master-data/CustodiansTab';
import { AssetGroupsTab, INITIAL_ASSET_GROUPS } from '../../components/master-data/AssetGroupsTab';
import { ClassesTab, INITIAL_CLASSES } from '../../components/master-data/ClassesTab';
import { CategoriesTab, INITIAL_CATEGORIES } from '../../components/master-data/CategoriesTab';
import { SubCategoriesTab, INITIAL_SUB_CATEGORIES } from '../../components/master-data/SubCategoriesTab';
import { LocationsTab, INITIAL_LOCATIONS } from '../../components/master-data/LocationsTab';
import { LocationLevelTab } from '../../components/master-data/LocationLevelTab';
import { DepartmentsTab, INITIAL_DEPARTMENTS } from '../../components/master-data/DepartmentsTab';
import { CostCentersTab, INITIAL_COST_CENTERS } from '../../components/master-data/CostCentersTab';
import { SuppliersTab, INITIAL_SUPPLIERS } from '../../components/master-data/SuppliersTab';
import {
  GenericMasterTab,
  DEFAULT_MANUFACTURERS,
  DEFAULT_BRANDS,
  DEFAULT_UOM,
  DEFAULT_STATUS_CODES,
  DEFAULT_ASSET_TYPES
} from '../../components/master-data/GenericMasterTab';
import { DepreciationPoliciesTab } from '../../components/master-data/DepreciationPoliciesTab';
import { DisposalStatusesTab } from '../../components/master-data/DisposalStatusesTab';
import { ConditionsTab } from '../../components/master-data/ConditionsTab';
import { api } from '../../services/api';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function escapeXml(unsafe) {
  return String(unsafe ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const MASTER_CONFIGS = {
  'item-master': {
    name: 'Item Master',
    endpoint: '/master-data/items?includeInactive=true',
    postEndpoint: '/master-data/items',
    dataKey: 'items',
    headers: ['Item Code', 'Item Name', 'Barcode', 'Category', 'Sub Category', 'Asset Group', 'Sub Group', 'Manufacturer', 'Brand', 'UOM', 'Description', 'Status'],
    fields: ['itemCode', 'itemName', 'supplierBarcode', 'categoryName', 'subCategoryName', 'assetGroupName', 'assetSubGroupName', 'manufacturerName', 'brandName', 'uom', 'description', 'status'],
    sampleRows: [
      ['ITM-LAP-01', 'Enterprise Laptop 15-inch', '8901234567890', 'Laptops & Notebooks', 'Business Laptops', 'Information Technology', 'Computer Equipment', 'Dell Technologies Inc.', 'Latitude', 'Unit', 'Enterprise i7 16GB RAM laptop', 'Active'],
      ['ITM-CHAIR-01', 'Ergonomic Mesh Chair High-Back', '8901234567891', 'Office Seating', 'Executive Chairs', 'Furniture & Fixtures', 'Office Furniture', 'Steelcase Inc.', 'Steelcase', 'Unit', 'Adjustable lumbar support chair', 'Active']
    ],
    mapRow: (r) => ({
      itemCode: r.itemCode || r['item code'] || r.code || '',
      itemName: r.itemName || r['item name'] || r.name || '',
      supplierBarcode: r.supplierBarcode || r.barcode || r['barcode'] || '',
      categoryName: r.categoryName || r['category'] || '',
      subCategoryName: r.subCategoryName || r['sub category'] || '',
      assetGroupName: r.assetGroupName || r['asset group'] || '',
      assetSubGroupName: r.assetSubGroupName || r['sub group'] || '',
      manufacturerName: r.manufacturerName || r['manufacturer'] || '',
      brandName: r.brandName || r['brand'] || '',
      uom: r.uom || r['uom'] || 'Unit',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'asset-groups': {
    name: 'Asset Groups',
    endpoint: '/master-data/asset-groups?includeInactive=true',
    postEndpoint: '/master-data/asset-groups',
    dataKey: 'assetGroups',
    headers: ['Group Code', 'Group Name', 'Asset Type', 'Description', 'Status'],
    fields: ['code', 'name', 'assetType', 'description', 'status'],
    sampleRows: [
      ['IT', 'Information Technology', 'Physical', 'Computers, servers, and networking hardware', 'Active'],
      ['VEH', 'Fleet Vehicles & Transport', 'Physical', 'Company automobiles, vans, and transport fleet', 'Active'],
      ['FURN', 'Furniture & Office Fixtures', 'Physical', 'Desks, chairs, cabinets, and workstations', 'Active'],
      ['SW', 'Enterprise Software Licenses', 'Intangible', 'ERP and operating system digital software licenses', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['group code'] || '',
      name: r.name || r['group name'] || '',
      assetType: r.assetType || r['asset type'] || 'Both',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'sub-groups': {
    name: 'Asset Sub Groups',
    endpoint: '/master-data/asset-sub-groups?includeInactive=true',
    postEndpoint: '/master-data/asset-sub-groups',
    dataKey: 'assetSubGroups',
    headers: ['Sub Group Code', 'Sub Group Name', 'Asset Group', 'Asset Type', 'Description', 'Status'],
    fields: ['code', 'name', 'groupName', 'assetType', 'description', 'status'],
    sampleRows: [
      ['COMP', 'Computer Equipment', 'Information Technology', 'Physical', 'Desktops, laptops, workstations, and tablets', 'Active'],
      ['NET', 'Network Infrastructure', 'Information Technology', 'Physical', 'Routers, switches, firewalls, and rack servers', 'Active'],
      ['OFF-FURN', 'Office Furniture', 'Furniture & Office Fixtures', 'Physical', 'Desks, ergonomic seating, and meeting tables', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['sub group code'] || r['class code'] || '',
      name: r.name || r['sub group name'] || r['class name'] || '',
      groupName: r.groupName || r['asset group'] || '',
      assetType: r.assetType || r['asset type'] || 'Both',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'classes': {
    name: 'Asset Sub Groups',
    endpoint: '/master-data/asset-sub-groups?includeInactive=true',
    postEndpoint: '/master-data/asset-sub-groups',
    dataKey: 'assetSubGroups',
    headers: ['Sub Group Code', 'Sub Group Name', 'Asset Group', 'Asset Type', 'Description', 'Status'],
    fields: ['code', 'name', 'groupName', 'assetType', 'description', 'status'],
    sampleRows: [
      ['COMP', 'Computer Equipment', 'Information Technology', 'Physical', 'Desktops, laptops, workstations, and tablets', 'Active'],
      ['NET', 'Network Infrastructure', 'Information Technology', 'Physical', 'Routers, switches, firewalls, and rack servers', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['sub group code'] || r['class code'] || '',
      name: r.name || r['sub group name'] || r['class name'] || '',
      groupName: r.groupName || r['asset group'] || '',
      assetType: r.assetType || r['asset type'] || 'Both',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'categories': {
    name: 'Categories',
    endpoint: '/master-data/categories?includeInactive=true',
    postEndpoint: '/master-data/categories',
    dataKey: 'categories',
    headers: ['Category Code', 'Category Name', 'Sub Group / Class', 'Asset Group', 'Description', 'Status'],
    fields: ['code', 'name', 'className', 'groupName', 'description', 'status'],
    sampleRows: [
      ['CAT-LAP', 'Laptops & Notebooks', 'Computer Equipment', 'Information Technology', 'Enterprise portable computing devices', 'Active'],
      ['CAT-SRV', 'Datacenter Servers', 'Computer Equipment', 'Information Technology', 'Rackmount and blade compute servers', 'Active'],
      ['CAT-CHR', 'Office Task Seating', 'Office Furniture', 'Furniture & Office Fixtures', 'Ergonomic task chairs and executive chairs', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['category code'] || '',
      name: r.name || r['category name'] || '',
      className: r.className || r['sub group / class'] || r['sub group'] || r['class'] || '',
      groupName: r.groupName || r['asset group'] || '',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'subcategories': {
    name: 'Sub Categories',
    endpoint: '/master-data/sub-categories?includeInactive=true',
    postEndpoint: '/master-data/sub-categories',
    dataKey: 'subCategories',
    headers: ['Sub Category Code', 'Sub Category Name', 'Category', 'Sub Group', 'Asset Group', 'Description', 'Status'],
    fields: ['code', 'name', 'categoryName', 'groupName', 'description', 'status'],
    sampleRows: [
      ['SCAT-BUS-LAP', 'Business Laptops 14-16 inch', 'Laptops & Notebooks', 'Computer Equipment', 'Information Technology', 'Standard enterprise notebooks', 'Active'],
      ['SCAT-ULTRA', 'Ultrabooks & 2-in-1s', 'Laptops & Notebooks', 'Computer Equipment', 'Information Technology', 'Lightweight executive notebooks', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['sub category code'] || '',
      name: r.name || r['sub category name'] || '',
      categoryName: r.categoryName || r['category'] || '',
      groupName: r.groupName || r['sub group'] || '',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'companies': {
    name: 'Companies',
    endpoint: '/master-data/companies?includeInactive=true',
    postEndpoint: '/master-data/companies',
    dataKey: 'companies',
    headers: ['Company Code', 'Company Name', 'Currency', 'Registration Number', 'Country', 'Status'],
    fields: ['code', 'name', 'currency', 'registrationNumber', 'country', 'status'],
    sampleRows: [
      ['COMP-HQ', 'Global Tech Enterprises FZE', 'USD', 'REG-2023-8891', 'United Arab Emirates', 'Active'],
      ['COMP-UK', 'Global Tech Services UK Ltd', 'GBP', 'GB-8829102', 'United Kingdom', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['company code'] || '',
      name: r.name || r['company name'] || '',
      currency: r.currency || r['currency'] || 'USD',
      registrationNumber: r.registrationNumber || r['registration number'] || '',
      country: r.country || r['country'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'custodians': {
    name: 'Custodians',
    endpoint: '/master-data/employees?includeInactive=true',
    postEndpoint: '/master-data/employees',
    dataKey: 'employees',
    headers: ['Custodian Code', 'Full Name', 'Email', 'Department', 'Custodian Type', 'Phone', 'Status'],
    fields: ['employeeCode', 'fullName', 'email', 'department', 'custodianType', 'phone', 'status'],
    sampleRows: [
      ['EMP-1001', 'Alexander Wright', 'alex.wright@asset360.internal', 'IT & Systems', 'Internal', '+971 50 123 4567', 'Active'],
      ['EMP-1002', 'Sarah Jenkins', 'sarah.j@asset360.internal', 'Operations & Logistics', 'Internal', '+971 50 234 5678', 'Active']
    ],
    mapRow: (r) => ({
      employeeCode: r.employeeCode || r['custodian code'] || r.code || '',
      fullName: r.fullName || r['full name'] || r.name || '',
      email: r.email || r['email'] || '',
      department: r.department || r['department'] || '',
      custodianType: r.custodianType || r['custodian type'] || 'Internal',
      phone: r.phone || r['phone'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'locations': {
    name: 'Locations',
    endpoint: '/master-data/sites?includeInactive=true',
    postEndpoint: '/master-data/sites',
    dataKey: 'sites',
    headers: ['Location Code', 'Location Name', 'Location Type', 'City', 'Country', 'Address', 'Status'],
    fields: ['code', 'name', 'type', 'city', 'country', 'address', 'status'],
    sampleRows: [
      ['LOC-DXB-HQ', 'Dubai Headquarters Tower A', 'Internal', 'Dubai', 'United Arab Emirates', 'Sheikh Zayed Road, DIFC, Floor 18', 'Active'],
      ['LOC-AUH-WH', 'Abu Dhabi Central Warehouse', 'Internal', 'Abu Dhabi', 'United Arab Emirates', 'Industrial Zone ICAD 1', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['location code'] || '',
      name: r.name || r['location name'] || '',
      type: r.type || r['location type'] || 'Internal',
      city: r.city || r['city'] || '',
      country: r.country || r['country'] || '',
      address: r.address || r['address'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'departments': {
    name: 'Departments',
    endpoint: '/master-data/departments?includeInactive=true',
    postEndpoint: '/master-data/departments',
    dataKey: 'departments',
    headers: ['Department Code', 'Department Name', 'Department Type', 'Manager', 'Email', 'Phone', 'Status'],
    fields: ['code', 'name', 'type', 'manager', 'email', 'phone', 'status'],
    sampleRows: [
      ['DEPT-IT', 'Information Technology', 'Internal', 'Michael Chen', 'it.manager@asset360.internal', '+971 50 111 2233', 'Active'],
      ['DEPT-FIN', 'Finance & Accounting', 'Internal', 'David Ross', 'finance.dir@asset360.internal', '+971 50 222 3344', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['department code'] || '',
      name: r.name || r['department name'] || '',
      type: r.type || r['department type'] || 'Internal',
      manager: r.manager || r['manager'] || '',
      email: r.email || r['email'] || '',
      phone: r.phone || r['phone'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'cost-centers': {
    name: 'Sections',
    endpoint: '/master-data/cost-centers?includeInactive=true',
    postEndpoint: '/master-data/cost-centers',
    dataKey: 'costCenters',
    headers: ['Section Code', 'Section Name', 'Type', 'Manager', 'Description', 'Status'],
    fields: ['code', 'name', 'type', 'manager', 'description', 'status'],
    sampleRows: [
      ['CC-1010', 'Corporate IT Operations', 'Operational', 'Michael Chen', 'Cost center for IT infrastructure', 'Active'],
      ['CC-2020', 'Executive Administration', 'Administrative', 'Sarah Mitchell', 'Corporate leadership center', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['section code'] || r['cost center code'] || '',
      name: r.name || r['section name'] || r['cost center name'] || '',
      type: r.type || r['type'] || 'Operational',
      manager: r.manager || r['manager'] || '',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'suppliers': {
    name: 'Suppliers',
    endpoint: '/master-data/suppliers?includeInactive=true',
    postEndpoint: '/master-data/suppliers',
    dataKey: 'suppliers',
    headers: ['Supplier Code', 'Supplier Name', 'Contact Person', 'Email', 'Phone', 'Website', 'Status'],
    fields: ['code', 'name', 'contact', 'email', 'phone', 'website', 'status'],
    sampleRows: [
      ['SUP-DELL', 'Dell Direct Enterprise Services', 'Marcus Vance', 'enterprise.sales@dell.com', '+1 800 624 9897', 'https://www.dell.com', 'Active'],
      ['SUP-CISCO', 'Cisco Systems Commercial Sales', 'Rachel Adams', 'sales-support@cisco.com', '+1 800 553 6387', 'https://www.cisco.com', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['supplier code'] || '',
      name: r.name || r['supplier name'] || '',
      contact: r.contact || r['contact person'] || '',
      email: r.email || r['email'] || '',
      phone: r.phone || r['phone'] || '',
      website: r.website || r['website'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'manufacturers': {
    name: 'Manufacturers',
    endpoint: '/master-data/manufacturers?includeInactive=true',
    postEndpoint: '/master-data/manufacturers',
    dataKey: 'manufacturers',
    headers: ['Manufacturer Code', 'Manufacturer Name', 'Website', 'Support Contact', 'Country', 'Status'],
    fields: ['code', 'name', 'website', 'supportContact', 'country', 'status'],
    sampleRows: [
      ['MFR-DELL', 'Dell Technologies Inc.', 'https://www.dell.com', 'prosupport@dell.com', 'United States', 'Active'],
      ['MFR-CISCO', 'Cisco Systems Inc.', 'https://www.cisco.com', 'tac@cisco.com', 'United States', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['manufacturer code'] || '',
      name: r.name || r['manufacturer name'] || '',
      website: r.website || r['website'] || '',
      supportContact: r.supportContact || r['support contact'] || '',
      country: r.country || r['country'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'brands': {
    name: 'Brands',
    endpoint: '/master-data/brands?includeInactive=true',
    postEndpoint: '/master-data/brands',
    dataKey: 'brands',
    headers: ['Brand Code', 'Brand Name', 'Manufacturer', 'Description', 'Status'],
    fields: ['code', 'name', 'manufacturerName', 'description', 'status'],
    sampleRows: [
      ['BRD-LAT', 'Latitude', 'Dell Technologies Inc.', 'Enterprise business laptops and convertibles', 'Active'],
      ['BRD-CAT', 'Catalyst', 'Cisco Systems Inc.', 'Enterprise ethernet switches and routers', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['brand code'] || '',
      name: r.name || r['brand name'] || '',
      manufacturerName: r.manufacturerName || r['manufacturer'] || '',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'uom': {
    name: 'Units of Measure',
    endpoint: '/master-data/uoms?includeInactive=true',
    postEndpoint: '/master-data/uoms',
    dataKey: 'uoms',
    headers: ['UOM Code', 'UOM Name', 'Symbol', 'Category', 'Description', 'Status'],
    fields: ['code', 'name', 'symbol', 'category', 'description', 'status'],
    sampleRows: [
      ['EA', 'Each / Unit', 'ea', 'Discrete Count', 'Standard single unit count item', 'Active'],
      ['SET', 'Set / Kit', 'set', 'Pack & Assembly', 'Assembly or grouped component package', 'Active'],
      ['LIC', 'Software License', 'lic', 'Digital & Rights', 'Named or concurrent user seat license', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['uom code'] || '',
      name: r.name || r['uom name'] || '',
      symbol: r.symbol || r['symbol'] || '',
      category: r.category || r['category'] || 'Discrete Count',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'status-codes': {
    name: 'Status Codes',
    endpoint: null,
    postEndpoint: null,
    dataKey: null,
    headers: ['Status Code', 'Status Name', 'Lifecycle Stage', 'Description', 'Status'],
    fields: ['code', 'name', 'stage', 'description', 'status'],
    sampleRows: [
      ['STAT-INUSE', 'In Service', 'Operational', 'Asset is currently active and assigned to custodian', 'Active'],
      ['STAT-STORE', 'In Storage', 'Inventory', 'Asset is held in storage available for allocation', 'Active'],
      ['STAT-REPAIR', 'Under Maintenance', 'Maintenance', 'Asset is undergoing scheduled repairs', 'Active']
    ],
    mapRow: (r) => ({
      id: `stat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      code: r.code || r['status code'] || '',
      name: r.name || r['status name'] || '',
      stage: r.stage || r['lifecycle stage'] || 'Operational',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active',
      active: (r.status || r['status']) !== 'Inactive'
    })
  },
  'disposal-statuses': {
    name: 'Disposal Statuses',
    endpoint: '/master-data/disposal-statuses',
    postEndpoint: '/master-data/disposal-statuses',
    dataKey: 'disposalStatuses',
    headers: ['Status Code', 'Status Name', 'Description', 'Status'],
    fields: ['code', 'name', 'description', 'status'],
    sampleRows: [
      ['DISP-SCRAP', 'Scrapped / Recycled', 'Asset physically retired and stripped for recycling', 'Active'],
      ['DISP-SOLD', 'Sold / Auctioned', 'Asset sold on secondary market or company employee auction', 'Active'],
      ['DISP-DONATE', 'Donated', 'Asset contributed to certified non-profit or educational program', 'Active'],
      ['DISP-WRITE', 'Written Off', 'Asset damaged beyond repair or accounted as complete loss', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['status code'] || '',
      name: r.name || r['status name'] || '',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'conditions': {
    name: 'Asset Conditions',
    endpoint: '/master-data/asset-conditions',
    postEndpoint: '/master-data/asset-conditions',
    dataKey: 'assetConditions',
    headers: ['Condition Code', 'Condition Name', 'Description', 'Status'],
    fields: ['code', 'name', 'description', 'status'],
    sampleRows: [
      ['COND-NEW', 'Brand New / Sealed', 'Factory sealed pristine item', 'Active'],
      ['COND-EXC', 'Excellent Condition', 'Minor or no cosmetic wear, fully operational', 'Active'],
      ['COND-GOOD', 'Good Condition', 'Normal operational wear and tear, fully operational', 'Active'],
      ['COND-FAIR', 'Fair / Usable', 'Noticeable cosmetic wear, operational', 'Active'],
      ['COND-POOR', 'Damaged / Needs Repair', 'Physical defects requiring servicing', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['condition code'] || '',
      name: r.name || r['condition name'] || '',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'asset-conditions': {
    name: 'Asset Conditions',
    endpoint: '/master-data/asset-conditions',
    postEndpoint: '/master-data/asset-conditions',
    dataKey: 'assetConditions',
    headers: ['Condition Code', 'Condition Name', 'Description', 'Status'],
    fields: ['code', 'name', 'description', 'status'],
    sampleRows: [
      ['COND-NEW', 'Brand New / Sealed', 'Factory sealed pristine item', 'Active'],
      ['COND-EXC', 'Excellent Condition', 'Minor or no cosmetic wear, fully operational', 'Active']
    ],
    mapRow: (r) => ({
      code: r.code || r['condition code'] || '',
      name: r.name || r['condition name'] || '',
      description: r.description || r['description'] || '',
      status: r.status || r['status'] || 'Active'
    })
  },
  'depreciation': {
    name: 'Depreciation Policies',
    endpoint: '/master-data/depreciation-policies',
    postEndpoint: null,
    dataKey: 'policies',
    headers: ['Asset Group', 'Sub Group', 'Method', 'Useful Life (Years)', 'Rate (%)', 'Salvage Value (%)'],
    fields: ['assetGroupName', 'assetSubGroupName', 'method', 'usefulLifeYears', 'ratePercent', 'salvagePercent'],
    sampleRows: [
      ['Information Technology', 'Computer Equipment', 'Straight Line', '4', '25.00', '5.00'],
      ['Fleet Vehicles & Transport', 'Fleet Vehicles', 'Reducing Balance', '5', '30.00', '10.00']
    ],
    mapRow: null
  }
};

const getMasterConfig = (tabId) => {
  if (tabId && tabId.startsWith('location-level-')) {
    const lvl = parseInt(tabId.replace('location-level-', ''), 10) || 1;
    return {
      name: `Location Level ${lvl}`,
      endpoint: `/master-data/location-levels/${lvl}`,
      postEndpoint: `/master-data/location-levels/${lvl}`,
      dataKey: 'locationLevels',
      headers: ['Code', 'Name', 'Description', 'Status'],
      fields: ['code', 'name', 'description', 'status'],
      sampleRows: [
        [`LVL${lvl}-01`, `Zone / Tier 01`, `Tier ${lvl} location classification`, 'Active'],
        [`LVL${lvl}-02`, `Zone / Tier 02`, `Tier ${lvl} location classification`, 'Active']
      ],
      mapRow: (r) => ({
        code: r.code || r['code'] || '',
        name: r.name || r['name'] || '',
        description: r.description || r['description'] || '',
        status: r.status || r['status'] || 'Active'
      })
    };
  }
  if (tabId === 'classes') return MASTER_CONFIGS['sub-groups'];
  if (tabId === 'asset-conditions') return MASTER_CONFIGS['conditions'];
  return MASTER_CONFIGS[tabId] || MASTER_CONFIGS['asset-groups'];
};

const formatItemToRow = (item, fields) => {
  return fields.map((field) => {
    let val = item[field];
    if (val === undefined || val === null) {
      if (field === 'code') val = item.itemCode || item.employeeCode || item.code || '';
      else if (field === 'name') val = item.itemName || item.fullName || item.name || '';
      else if (field === 'itemCode') val = item.code || '';
      else if (field === 'itemName') val = item.name || '';
      else if (field === 'employeeCode') val = item.code || item.employeeId || '';
      else if (field === 'groupName') val = item.assetGroupName || item.group || '';
      else if (field === 'className') val = item.assetSubGroupName || item.subGroupName || '';
      else if (field === 'categoryName') val = item.category || '';
      else if (field === 'subCategoryName') val = item.subCategory || '';
      else if (field === 'supplierBarcode') val = item.barcode || '';
      else if (field === 'contact') val = item.contactPerson || '';
      else if (field === 'registrationNumber') val = item.regNumber || '';
      else val = '';
    }
    if (typeof val === 'boolean') val = val ? 'Active' : 'Inactive';
    return String(val);
  });
};

const fetchActiveTabExportData = async (config, activeTab) => {
  if (activeTab === 'status-codes') {
    try {
      const custom = JSON.parse(localStorage.getItem('fams_custom_status_codes') || '[]');
      return custom.length > 0 ? custom : DEFAULT_STATUS_CODES;
    } catch {
      return DEFAULT_STATUS_CODES;
    }
  }
  if (!config.endpoint) {
    return config.sampleRows.map((row) => {
      const obj = {};
      config.fields.forEach((f, i) => {
        obj[f] = row[i];
      });
      return obj;
    });
  }
  try {
    const res = await api.get(config.endpoint);
    let items = [];
    if (config.dataKey && res[config.dataKey]) {
      items = res[config.dataKey];
    } else if (res.items || res.data || res.records) {
      items = res.items || res.data || res.records;
    } else if (Array.isArray(res)) {
      items = res;
    } else {
      for (const val of Object.values(res)) {
        if (Array.isArray(val) && val.length > 0) {
          items = val;
          break;
        }
      }
    }
    if (items && items.length > 0) return items;
  } catch (err) {
    console.warn('Export fetch failed, using fallback:', err);
  }

  // Fallback to initial/sample data if API was empty or errored
  if (config.sampleRows && config.sampleRows.length > 0) {
    return config.sampleRows.map((row) => {
      const obj = {};
      config.fields.forEach((f, i) => {
        obj[f] = row[i];
      });
      return obj;
    });
  }
  return [];
};

const getSingularName = (name = '') => {
  if (name.startsWith('Location Level')) return name;
  if (name === 'Asset Sub Groups' || name === 'Sub Groups') return 'Asset Sub Group';
  if (name.endsWith('Classes')) return name.slice(0, -2);
  if (name.endsWith('Statuses')) return name.slice(0, -2);
  if (name.endsWith('ies')) return name.slice(0, -3) + 'y';
  if (name === 'Status Codes') return 'Status Code';
  if (name === 'UOM' || name === 'UOM (Units)') return 'UOM';
  if (name.endsWith('s')) return name.slice(0, -1);
  return name;
};

export function MasterDataSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'asset-groups';

  const handleTabChange = (tabId) => {
    const moreItem = MORE_TABS.find((t) => t.id === tabId);
    if (moreItem && moreItem.action === 'prefixes') {
      setShowCodePrefixModal(true);
      return;
    }
    if (moreItem && moreItem.action === 'audit') {
      setShowAuditHistoryModal(true);
      return;
    }
    if (moreItem && moreItem.action === 'guidelines') {
      setShowImportGuidelinesModal(true);
      return;
    }
    navigate(`/admin/master-data?tab=${tabId}`, { replace: true });
  };

  const importDropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);
  const addDropdownRef = useRef(null);

  const [activeRowMenuId, setActiveRowMenuId] = useState(null);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  // Global Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportHistoryModal, setShowImportHistoryModal] = useState(false);
  const [showImportGuidelinesModal, setShowImportGuidelinesModal] = useState(false);
  const [showAuditHistoryModal, setShowAuditHistoryModal] = useState(false);
  const [showAddMultipleModal, setShowAddMultipleModal] = useState(false);
  const [showCodePrefixModal, setShowCodePrefixModal] = useState(false);

  const handleCloseCodePrefixModal = () => {
    setShowCodePrefixModal(false);
  };

  useEffect(() => {
    if (searchParams.get('tab') === 'code-prefixes') {
      setShowCodePrefixModal(true);
    }
  }, [searchParams]);

  // External trigger for Add Modal in active tab
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [activeAddModalTab, setActiveAddModalTab] = useState(null);
  const [groupReloadTrigger, setGroupReloadTrigger] = useState(0);

  // Reset active add modal tab when switching tabs so popups never open on tab switch
  useEffect(() => {
    setActiveAddModalTab(null);
    setShowAddGroupModal(false);
  }, [activeTab]);

  // State for Add Multiple Records
  const [multipleRecordsRows, setMultipleRecordsRows] = useState([
    { code: '', name: '', assetType: 'Both', description: '' },
    { code: '', name: '', assetType: 'Physical', description: '' },
    { code: '', name: '', assetType: 'Intangible', description: '' }
  ]);
  const [isSavingMultiple, setIsSavingMultiple] = useState(false);

  // State for Import Template
  const [importFileName, setImportFileName] = useState('');
  const [importParsedRows, setImportParsedRows] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTriggerAddSingle = () => {
    setShowAddDropdown(false);
    if (activeTab === 'asset-groups') {
      setShowAddGroupModal(true);
    } else if (activeTab === 'classes' || activeTab === 'sub-groups') {
      setActiveAddModalTab('sub-groups');
    } else {
      setActiveAddModalTab(activeTab);
    }
  };

  const handleSaveMultipleRecords = async () => {
    const validRows = multipleRecordsRows.filter((r) => r.code.trim() && r.name.trim());
    if (validRows.length === 0) {
      triggerToast('Please provide at least one record with both Code and Name.');
      return;
    }
    const config = getMasterConfig(activeTab);
    setIsSavingMultiple(true);
    try {
      if (activeTab === 'status-codes') {
        const existing = JSON.parse(localStorage.getItem('fams_custom_status_codes') || JSON.stringify(DEFAULT_STATUS_CODES));
        const newRecords = validRows.map((r) => ({
          id: `stat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          code: r.code.trim().toUpperCase(),
          name: r.name.trim(),
          stage: 'Operational',
          description: r.description || '',
          status: 'Active',
          active: true
        }));
        localStorage.setItem('fams_custom_status_codes', JSON.stringify([...newRecords, ...existing]));
        triggerToast(`Successfully added ${validRows.length} Status Codes!`);
      } else if (config.postEndpoint || config.endpoint) {
        const targetUrl = config.postEndpoint || config.endpoint.split('?')[0];
        let created = 0;
        for (const r of validRows) {
          try {
            const mapped = config.mapRow
              ? config.mapRow({
                  ...r,
                  code: r.code.trim().toUpperCase(),
                  name: r.name.trim(),
                  assetType: r.assetType || 'Both',
                  description: r.description || '',
                  status: 'Active'
                })
              : {
                  code: r.code.trim().toUpperCase(),
                  name: r.name.trim(),
                  assetType: r.assetType || 'Both',
                  description: r.description || '',
                  status: 'Active'
                };
            await api.post(targetUrl, mapped);
            created++;
          } catch (rowErr) {
            console.warn('Batch create error:', rowErr.response?.data?.message || rowErr.message);
          }
        }
        triggerToast(`Successfully created ${created} ${config.name} records!`);
      }
      setGroupReloadTrigger((prev) => prev + 1);
      setShowAddMultipleModal(false);
      setMultipleRecordsRows([
        { code: '', name: '', assetType: 'Both', description: '' },
        { code: '', name: '', assetType: 'Physical', description: '' },
        { code: '', name: '', assetType: 'Intangible', description: '' }
      ]);
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Failed to save some records.');
    } finally {
      setIsSavingMultiple(false);
    }
  };

  const handleDownloadTemplate = () => {
    const config = getMasterConfig(activeTab);
    const headersStr = config.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
    const sampleStr = config.sampleRows
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n') + '\n';

    const blob = new Blob([headersStr + sampleStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${config.name.replace(/\s+/g, '_')}_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`${config.name} CSV template downloaded.`);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        triggerToast('The uploaded CSV file is empty or missing data rows.');
        return;
      }
      const config = getMasterConfig(activeTab);
      const headerLine = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

      const dataRows = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = parseCSVLine(lines[i]);
        if (parts.length === 0 || parts.every((p) => !p.trim())) continue;

        const rowObj = {};
        headerLine.forEach((hdr, idx) => {
          rowObj[hdr] = parts[idx] !== undefined ? parts[idx] : '';
        });
        config.fields.forEach((fieldKey, idx) => {
          if (rowObj[fieldKey] === undefined && parts[idx] !== undefined) {
            rowObj[fieldKey] = parts[idx];
          }
        });

        const mapped = config.mapRow ? config.mapRow(rowObj) : rowObj;
        const hasIdent = mapped.name || mapped.itemName || mapped.fullName || mapped.code || mapped.itemCode || parts[0] || parts[1];
        if (hasIdent) {
          dataRows.push(mapped);
        }
      }

      setImportParsedRows(dataRows);
      triggerToast(`Loaded ${dataRows.length} valid rows from ${file.name}. Click "Start Import" to save.`);
    };
    reader.readAsText(file);
  };

  const handleStartImport = async () => {
    if (importParsedRows.length === 0) {
      triggerToast('Please select a valid CSV file first.');
      return;
    }
    const config = getMasterConfig(activeTab);
    setIsImporting(true);
    let imported = 0;
    try {
      if (activeTab === 'status-codes') {
        const existing = JSON.parse(localStorage.getItem('fams_custom_status_codes') || JSON.stringify(DEFAULT_STATUS_CODES));
        const updated = [
          ...importParsedRows,
          ...existing.filter((e) => !importParsedRows.some((r) => (r.code && r.code.toUpperCase() === (e.code || '').toUpperCase())))
        ];
        localStorage.setItem('fams_custom_status_codes', JSON.stringify(updated));
        imported = importParsedRows.length;
      } else if (config.postEndpoint || config.endpoint) {
        const targetUrl = config.postEndpoint || config.endpoint.split('?')[0];
        for (const row of importParsedRows) {
          try {
            await api.post(targetUrl, row);
            imported++;
          } catch (err) {
            console.warn('Row import failed:', err.response?.data?.message || err.message);
          }
        }
      }

      // Record in import history
      try {
        const history = JSON.parse(localStorage.getItem('fams_import_history') || '[]');
        history.unshift({
          id: `imp-${Date.now()}`,
          entity: config.name,
          fileName: importFileName || 'uploaded_data.csv',
          totalRows: importParsedRows.length,
          importedRows: imported,
          timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('fams_import_history', JSON.stringify(history.slice(0, 30)));
      } catch (_) {}

      setGroupReloadTrigger((prev) => prev + 1);
      setShowImportModal(false);
      setImportFileName('');
      setImportParsedRows([]);
      triggerToast(`Successfully imported ${imported} of ${importParsedRows.length} ${config.name} records from CSV!`);
    } catch {
      triggerToast('Import encountered an error. Please verify the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (importDropdownRef.current && !importDropdownRef.current.contains(e.target)) {
        setShowImportDropdown(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target)) {
        setShowExportDropdown(false);
      }
      if (addDropdownRef.current && !addDropdownRef.current.contains(e.target)) {
        setShowAddDropdown(false);
      }
      if (activeRowMenuId && !e.target.closest('.relative')) {
        setActiveRowMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeRowMenuId]);

  // Handle Universal Export to CSV
  const handleExportCSV = async () => {
    setShowExportDropdown(false);
    const config = getMasterConfig(activeTab);
    try {
      const records = await fetchActiveTabExportData(config, activeTab);
      const rows = records.map((item) => formatItemToRow(item, config.fields));
      const csvContent = [
        config.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
        ...rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${config.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast(`Exported ${rows.length} ${config.name} records to CSV!`);
    } catch (err) {
      triggerToast(`Failed to export CSV: ${err.message || 'Error'}`);
    }
  };

  // Handle Universal Export to Excel (.xls XML format)
  const handleExportExcel = async () => {
    setShowExportDropdown(false);
    const config = getMasterConfig(activeTab);
    try {
      const records = await fetchActiveTabExportData(config, activeTab);
      const rows = records.map((item) => formatItemToRow(item, config.fields));
      const excelHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <style>
            table { border-collapse: collapse; font-family: Calibri, sans-serif; }
            th { background-color: #6C2BD9; color: #ffffff; font-weight: bold; border: 1px solid #5B21B6; padding: 8px 12px; }
            td { border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 11pt; }
            tr:nth-child(even) { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${config.headers.map((h) => `<th>${escapeXml(h)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map((r) => `<tr>${r.map((c) => `<td>${escapeXml(c)}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${config.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast(`Exported ${rows.length} ${config.name} records to Excel!`);
    } catch (err) {
      triggerToast(`Failed to export Excel: ${err.message || 'Error'}`);
    }
  };

  // Handle Universal Export to PDF / Print view
  const handleExportPDF = async () => {
    setShowExportDropdown(false);
    const config = getMasterConfig(activeTab);
    try {
      const records = await fetchActiveTabExportData(config, activeTab);
      const rows = records.map((item) => formatItemToRow(item, config.fields));

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        triggerToast('Popup blocked. Please allow popups for printable export.');
        return;
      }
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${escapeXml(config.name)} Master Data Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 24px; color: #0f172a; margin: 0; }
            .report-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #6C2BD9; padding-bottom: 12px; margin-bottom: 16px; }
            .org-title { font-size: 18px; font-weight: 800; color: #1e1b4b; margin: 0; }
            .report-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
            .report-meta { text-align: right; font-size: 11px; color: #64748b; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
            th { background-color: #f1f5f9; color: #334155; font-weight: 700; text-align: left; padding: 7px 10px; border: 1px solid #cbd5e1; }
            td { padding: 6px 10px; border: 1px solid #e2e8f0; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge-active { display: inline-block; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: #ecfdf5; color: #047857; }
            .badge-inactive { display: inline-block; padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: #fef2f2; color: #b91c1c; }
            @media print {
              @page { size: landscape; margin: 12mm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div>
              <h1 class="org-title">Asset360 Enterprise &bull; ${escapeXml(config.name)} Report</h1>
              <div class="report-sub">Master Data Export &bull; Fixed Asset Management System</div>
            </div>
            <div class="report-meta">
              <div><strong>Total Records:</strong> ${rows.length}</div>
              <div><strong>Export Date:</strong> ${new Date().toLocaleString()}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>${config.headers.map((h) => `<th>${escapeXml(h)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map((r) => `
                <tr>
                  ${r.map((c) => `
                    <td>
                      ${c === 'Active' ? '<span class="badge-active">Active</span>' : c === 'Inactive' ? '<span class="badge-inactive">Inactive</span>' : escapeXml(c)}
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
      triggerToast(`Exporting ${rows.length} ${config.name} records to PDF...`);
    } catch (err) {
      triggerToast(`Failed to export PDF: ${err.message || 'Error'}`);
    }
  };

  // Exact 11 items matching the Master Data section in the left sidebar
  const TABS = [
    { id: 'item-master', name: 'Item Master', icon: Box, desc: 'Central catalog of items defining code, name, barcode, and classification hierarchy before asset registration.' },
    { id: 'asset-groups', name: 'Asset Groups', icon: Box, desc: 'Define and manage asset groups to classify your assets across the Asset360 enterprise platform.' },
    { id: 'sub-groups', aliasId: 'classes', name: 'Asset Sub Groups', icon: Layers, desc: 'Define and manage asset sub groups within each asset group for classification and lifecycle control.' },
    { id: 'categories', name: 'Categories', icon: Tag, desc: 'Define and manage asset categories within each class.' },
    { id: 'subcategories', name: 'Sub Categories', icon: FolderTree, desc: 'Define and manage granular asset sub categories within each category.' },
    { id: 'companies', name: 'Companies', icon: Building2, desc: 'Define legal entities and corporate operating units for asset ownership and financial reporting.' },
    { id: 'custodians', name: 'Custodians', icon: UserCheck, desc: 'Manage internal employees and external custodians responsible for asset care, custody, and physical tracking.' },
    { id: 'locations', name: 'Locations', icon: MapPin, desc: 'Define and manage physical sites, campuses, buildings, and rooms where assets are deployed.' },
    { id: 'location-level-1', name: 'Location Level 1', icon: MapPin, desc: 'Define and manage Location Level 1 records.' },
    { id: 'location-level-2', name: 'Location Level 2', icon: MapPin, desc: 'Define and manage Location Level 2 records.' },
    { id: 'location-level-3', name: 'Location Level 3', icon: MapPin, desc: 'Define and manage Location Level 3 records.' },
    { id: 'location-level-4', name: 'Location Level 4', icon: MapPin, desc: 'Define and manage Location Level 4 records.' },
    { id: 'departments', name: 'Departments', icon: Users, desc: 'Define and manage organizational departments for asset ownership and financial accountability.' },
    { id: 'cost-centers', name: 'Sections', icon: BarChart3, desc: 'Define and manage sections for budget allocation, depreciation charging, and financial reporting.' },
    { id: 'suppliers', name: 'Suppliers', icon: Truck, desc: 'Manage approved vendors and suppliers for asset procurement, warranties, and maintenance services.' },
    { id: 'manufacturers', name: 'Manufacturers', icon: Factory, desc: 'Manage approved equipment manufacturers, OEM specs, vendor portals, and technical support.' },
    { id: 'brands', name: 'Brands', icon: Tag, desc: 'Manage equipment and product brands linked to items and asset catalog.' },
    { id: 'uom', name: 'UOM', icon: Scale, desc: 'Define standard Units of Measure (UOM) for inventory parts, bulk materials, and asset counting.' },
    { id: 'status-codes', name: 'Status Codes', icon: ShieldCheck, desc: 'Configure lifecycle status codes, operational states, and workflow status indicators.' },
    { id: 'disposal-statuses', name: 'Disposal Statuses', icon: Trash2, desc: 'Manage disposal statuses (Scrapped, Sold, Donated, Written Off, Traded In) for asset retirement transactions.' },
    { id: 'conditions', aliasId: 'asset-conditions', name: 'Conditions', icon: ShieldCheck, desc: 'Define and manage asset physical and operational conditions (New, Good, Fair, Damaged, Scrap) across the asset lifecycle.' }
  ];

  const MORE_TABS = [
    { id: 'code-prefixes', name: 'Code Prefix Settings', icon: Settings, desc: 'Configure autogenerated code prefixes for all master records.', action: 'prefixes' },
    { id: 'depreciation', name: 'Depreciation Policies', icon: BarChart3, desc: 'Configure accounting depreciation methods, asset useful lives, and salvage value policies.' },
    { id: 'audit-log', name: 'Audit History Log', icon: Clock, desc: 'Inspect system-wide change audit trails and master data modification logs.', action: 'audit' },
    { id: 'import-guidelines', name: 'Import Guidelines', icon: BookOpen, desc: 'Read standard CSV data guidelines and column specifications for master data bulk imports.', action: 'guidelines' }
  ];

  const currentTabObject = TABS.find((t) => t.id === activeTab || t.aliasId === activeTab) || MORE_TABS.find((t) => t.id === activeTab);

  return (
    <div className="space-y-4 pb-12 select-none text-slate-900">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl bg-slate-900 text-white text-xs border border-slate-700 animate-in slide-in-from-bottom-3 fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
            <span className="hover:text-[#6C2BD9] cursor-pointer">Master Data</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-[#6C2BD9] font-bold">
              {currentTabObject ? currentTabObject.name : 'Asset Groups'}
            </span>
          </div>

          <h1 className="text-2xl font-black text-[#1E1B4B] tracking-tight">
            {currentTabObject ? currentTabObject.name : 'Asset Groups'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {currentTabObject?.desc || 'Define and manage master data records to classify your assets across the Asset360 enterprise platform.'}
          </p>
        </div>

        {/* Action Buttons Top Right (only shown for actual master entity tables) */}
        {!['depreciation', 'code-prefixes', 'audit-log', 'import-guidelines'].includes(activeTab) && <div className="flex items-center gap-2 relative">
          {/* Import Dropdown */}
          <div className="relative" ref={importDropdownRef}>
            <button
              onClick={() => {
                setShowImportDropdown(!showImportDropdown);
                setShowExportDropdown(false);
                setShowAddDropdown(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Import</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showImportDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-40 space-y-1">
                <button
                  onClick={() => {
                    setShowImportDropdown(false);
                    handleDownloadTemplate();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Download Template</span>
                </button>
                <button
                  onClick={() => {
                    setShowImportDropdown(false);
                    setShowImportModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Upload File</span>
                </button>
                <button
                  onClick={() => {
                    setShowImportDropdown(false);
                    setShowImportHistoryModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>View Import History</span>
                </button>
                <button
                  onClick={() => {
                    setShowImportDropdown(false);
                    setShowImportGuidelinesModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Import Guidelines</span>
                </button>
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => {
                setShowExportDropdown(!showExportDropdown);
                setShowImportDropdown(false);
                setShowAddDropdown(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showExportDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-40 space-y-1">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Export to CSV</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Export to Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Export to PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Dropdown */}
          <div className="relative" ref={addDropdownRef}>
            <div className="inline-flex items-center rounded-xl shadow-xs overflow-hidden bg-[#6C2BD9]">
              <button
                onClick={handleTriggerAddSingle}
                className="px-3.5 py-2 hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title={`Add new ${getSingularName(currentTabObject?.name || 'Group')}`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add {getSingularName(currentTabObject?.name || 'Group')}</span>
              </button>
              <button
                onClick={() => {
                  setShowAddDropdown(!showAddDropdown);
                  setShowImportDropdown(false);
                  setShowExportDropdown(false);
                }}
                className="px-2 py-2.5 hover:bg-[#5B21B6] text-white text-xs transition-all border-l border-white/20 cursor-pointer"
                title="Creation Options"
              >
                <ChevronDown className="w-3.5 h-3.5 text-white/90" />
              </button>
            </div>

            {showAddDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-40 space-y-1">
                <button
                  onClick={handleTriggerAddSingle}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Add New Record</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddDropdown(false);
                    setShowAddMultipleModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Add Multiple Records</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddDropdown(false);
                    setShowImportModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#6C2BD9]" />
                  <span>Import from Template</span>
                </button>
              </div>
            )}
          </div>
        </div>}
      </div>

      {/* RENDER MODULAR TABS */}
      {activeTab === 'code-prefixes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-10 text-center max-w-xl mx-auto space-y-4 my-8 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#6C2BD9] border border-purple-100 flex items-center justify-center mx-auto shadow-2xs">
            <Settings className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Master Code Prefix Settings</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Configure system-wide autogenerated code prefixes for all master entities including Organization, Locations, Asset Groups, Categories, Suppliers, and Statuses.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCodePrefixModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Open Code Prefix Settings</span>
          </button>
        </div>
      )}

      {activeTab === 'item-master' && (
        <ItemMasterTab
          key={`item-master-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === 'item-master'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
          onNavigateTab={handleTabChange}
        />
      )}

      {activeTab === 'asset-groups' && (
        <AssetGroupsTab
          key={`asset-groups-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={showAddGroupModal}
          setExternalShowAddModal={setShowAddGroupModal}
          reloadTrigger={groupReloadTrigger}
          onNavigateTab={handleTabChange}
        />
      )}

      {(activeTab === 'classes' || activeTab === 'sub-groups') && (
        <ClassesTab
          key={`classes-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'classes' || activeAddModalTab === 'sub-groups'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'categories' && (
        <CategoriesTab
          key={`categories-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'categories'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'depreciation' && <DepreciationPoliciesTab key={`depreciation-${groupReloadTrigger}`} />}

      {activeTab === 'subcategories' && (
        <SubCategoriesTab
          key={`subcategories-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'subcategories'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'companies' && (
        <CompaniesTab
          key={`companies-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === 'companies'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'custodians' && (
        <CustodiansTab
          key={`custodians-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === 'custodians'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'locations' && (
        <LocationsTab
          key={`locations-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'locations'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
          onNavigateTab={handleTabChange}
        />
      )}

      {activeTab === 'departments' && (
        <DepartmentsTab
          key={`departments-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'departments'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {['location-level-1', 'location-level-2', 'location-level-3', 'location-level-4'].includes(activeTab) && (
        <LocationLevelTab
          key={`${activeTab}-${groupReloadTrigger}`}
          level={parseInt(activeTab.replace('location-level-', ''), 10)}
          levelName={currentTabObject?.name || 'Location Level'}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === activeTab}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
          onNavigateTab={handleTabChange}
        />
      )}

      {activeTab === 'cost-centers' && (
        <CostCentersTab
          key={`cost-centers-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          setShowAuditHistoryModal={setShowAuditHistoryModal}
          externalShowAddModal={activeAddModalTab === 'cost-centers'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'suppliers' && (
        <SuppliersTab
          key={`suppliers-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === 'suppliers'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {activeTab === 'disposal-statuses' && (
        <DisposalStatusesTab
          key={`disposal-statuses-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === 'disposal-statuses'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {(activeTab === 'conditions' || activeTab === 'asset-conditions') && (
        <ConditionsTab
          key={`conditions-${groupReloadTrigger}`}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === 'conditions' || activeAddModalTab === 'asset-conditions'}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
        />
      )}

      {/* GENERIC MASTER DATA TABS (Asset Types, Manufacturers, UOM, Status Codes & Custom Views) */}
      {['manufacturers', 'brands', 'uom', 'status-codes', 'asset-types'].includes(activeTab) && (
        <GenericMasterTab
          key={`${activeTab}-${groupReloadTrigger}`}
          activeTab={activeTab}
          tabName={currentTabObject?.name}
          triggerToast={triggerToast}
          activeRowMenuId={activeRowMenuId}
          setActiveRowMenuId={setActiveRowMenuId}
          externalShowAddModal={activeAddModalTab === activeTab}
          setExternalShowAddModal={(val) => !val && setActiveAddModalTab(null)}
          onResetToDefault={() => handleTabChange('asset-groups')}
        />
      )}

      {/* GLOBAL MODAL 1: Audit History Log */}
      {showAuditHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#6C2BD9]" />
                <span>Audit History Log</span>
              </h3>
              <button onClick={() => setShowAuditHistoryModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1">
              <div className="p-8 text-center text-slate-500">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No Audit Logs Available</p>
                <p className="text-[11px] text-slate-400 mt-1">Audit log records will be tracked dynamically when master data records are created, updated, or removed.</p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowAuditHistoryModal(false)}
                className="px-4 py-2 bg-[#6C2BD9] text-white font-bold rounded-xl text-xs hover:bg-[#5B21B6]"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL MODAL 2: Add Multiple Records Modal */}
      {showAddMultipleModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6C2BD9]" />
                <span>Add Multiple {currentTabObject?.name || 'Records'}</span>
              </h3>
              <button
                onClick={() => setShowAddMultipleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enter multiple items below. All valid records will be batch created in master data.
            </p>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Code *</th>
                    <th className="py-2.5 px-3">Name *</th>
                    <th className="py-2.5 px-3 w-40">Asset Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {multipleRecordsRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.code}
                          placeholder="e.g. LAB"
                          onChange={(e) => {
                            const updated = [...multipleRecordsRows];
                            updated[idx].code = e.target.value.toUpperCase();
                            setMultipleRecordsRows(updated);
                          }}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:border-[#6C2BD9] focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.name}
                          placeholder="e.g. Laboratory Assets"
                          onChange={(e) => {
                            const updated = [...multipleRecordsRows];
                            updated[idx].name = e.target.value;
                            setMultipleRecordsRows(updated);
                          }}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-[#6C2BD9] focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={row.assetType}
                          onChange={(e) => {
                            const updated = [...multipleRecordsRows];
                            updated[idx].assetType = e.target.value;
                            setMultipleRecordsRows(updated);
                          }}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:border-[#6C2BD9] focus:outline-none"
                        >
                          <option value="Both">Both (Physical/Intangible)</option>
                          <option value="Physical">Physical Tangible</option>
                          <option value="Intangible">Intangible / Digital</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.description}
                          placeholder="Optional description..."
                          onChange={(e) => {
                            const updated = [...multipleRecordsRows];
                            updated[idx].description = e.target.value;
                            setMultipleRecordsRows(updated);
                          }}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:border-[#6C2BD9] focus:outline-none"
                        />
                      </td>
                      <td className="p-2 text-center">
                        {multipleRecordsRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = multipleRecordsRows.filter((_, i) => i !== idx);
                              setMultipleRecordsRows(updated);
                            }}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() =>
                  setMultipleRecordsRows([
                    ...multipleRecordsRows,
                    { code: '', name: '', assetType: 'Both', description: '' }
                  ])
                }
                className="px-3 py-1.5 rounded-xl border border-dashed border-purple-300 hover:border-[#6C2BD9] text-[#6C2BD9] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Row</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMultipleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingMultiple}
                  onClick={handleSaveMultipleRecords}
                  className="px-5 py-2 rounded-xl bg-[#6C2BD9] hover:bg-[#5B21B6] text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isSavingMultiple && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    Save Records ({multipleRecordsRows.filter((r) => r.code.trim() && r.name.trim()).length})
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL MODAL 3: Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-[#6C2BD9]" />
                <span>Import {currentTabObject?.name || 'Records'}</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-200 rounded-2xl p-6 text-center bg-purple-50/40 space-y-2 cursor-pointer hover:bg-purple-50/70 transition-colors"
            >
              <Upload className="w-8 h-8 text-[#6C2BD9] mx-auto" />
              {importFileName ? (
                <div>
                  <p className="text-xs font-bold text-[#6C2BD9]">{importFileName}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    {importParsedRows.length} valid rows ready to import
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-800">Click to upload or drag CSV file</p>
                  <p className="text-[11px] text-slate-400">Supports standard .csv format</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-[#6C2BD9] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Template</span>
              </button>
              <button
                type="button"
                disabled={isImporting || importParsedRows.length === 0}
                onClick={handleStartImport}
                className={clsx(
                  'px-4 py-2 rounded-xl text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer',
                  importParsedRows.length > 0
                    ? 'bg-[#6C2BD9] hover:bg-[#5B21B6]'
                    : 'bg-slate-300 cursor-not-allowed'
                )}
              >
                {isImporting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Start Import ({importParsedRows.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL MODAL 4: Import History Modal */}
      {showImportHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-[#6C2BD9]" />
                <span>Import History</span>
              </h3>
              <button onClick={() => setShowImportHistoryModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-1">
              {(() => {
                const history = JSON.parse(localStorage.getItem('fams_import_history') || '[]');
                if (history.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-500">
                      <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No Import History Found</p>
                      <p className="text-[11px] text-slate-400 mt-1">Completed CSV master data imports will be logged here with timestamps and row counts.</p>
                    </div>
                  );
                }
                return (
                  <div className="divide-y divide-slate-100">
                    {history.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{item.entity}</p>
                          <p className="text-[11px] text-slate-400">{item.fileName} &bull; {item.timestamp}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.importedRows} / {item.totalRows} Imported
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('fams_import_history');
                  triggerToast('Import history cleared.');
                  setShowImportHistoryModal(false);
                }}
                className="text-xs text-rose-600 hover:underline cursor-pointer font-medium"
              >
                Clear History
              </button>
              <button
                onClick={() => setShowImportHistoryModal(false)}
                className="px-4 py-2 bg-[#6C2BD9] text-white font-bold rounded-xl text-xs hover:bg-[#5B21B6] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL MODAL 5: Import Guidelines Modal */}
      {showImportGuidelinesModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#6C2BD9]" />
                <span>Import Guidelines &bull; {currentTabObject?.name || 'Master Data'}</span>
              </h3>
              <button onClick={() => setShowImportGuidelinesModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-80 overflow-y-auto pr-1 text-slate-600">
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-1">
                <p className="font-bold text-[#6C2BD9]">Standard CSV File Requirements</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Use UTF-8 encoded .csv files. First line must contain column headers matching the template. Values containing commas or quotes should be enclosed in double quotes.
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-1.5">Columns Expected for {currentTabObject?.name || 'Active Master'}:</p>
                <div className="flex flex-wrap gap-1.5">
                  {getMasterConfig(activeTab).headers.map((h, i) => (
                    <span key={i} className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-500">
                <p>&bull; <strong>Codes:</strong> Must be unique. Duplicates are automatically skipped during batch import.</p>
                <p>&bull; <strong>Status:</strong> Use &quot;Active&quot; or &quot;Inactive&quot; (defaults to &quot;Active&quot; if left empty).</p>
                <p>&bull; <strong>Relationships:</strong> Group, Category, and Manufacturer names should correspond to existing master names.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  handleDownloadTemplate();
                  setShowImportGuidelinesModal(false);
                }}
                className="text-xs text-[#6C2BD9] hover:underline cursor-pointer font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Template</span>
              </button>
              <button
                onClick={() => setShowImportGuidelinesModal(false)}
                className="px-4 py-2 bg-[#6C2BD9] text-white font-bold rounded-xl text-xs hover:bg-[#5B21B6] cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Prefix Settings Modal */}
      <CodePrefixSettingsModal
        isOpen={showCodePrefixModal}
        onClose={handleCloseCodePrefixModal}
      />
    </div>
  );
}

export default MasterDataSetup;

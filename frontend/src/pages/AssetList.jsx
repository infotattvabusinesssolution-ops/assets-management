import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { Plus, Search, Filter, Download, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AssetList() {
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAssets = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/assets?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
      if (res.success) {
        setAssets(res.assets);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets(1);
  }, [search]);

  const columns = [
    {
      header: 'Asset ID',
      accessorKey: 'assetId',
      cell: (info) => (
        <span
          onClick={() => navigate(`/assets/${info.row.original._id}`)}
          className="font-mono font-bold text-[#6c2bd9] hover:underline cursor-pointer"
        >
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (info) => <span className="font-semibold text-slate-800">{info.getValue()}</span>
    },
    {
      header: 'Tag / Barcode',
      accessorKey: 'tagNumber',
      cell: (info) => <span className="font-mono text-xs text-slate-500">{info.getValue() || '—'}</span>
    },
    {
      header: 'Serial Number',
      accessorKey: 'serialNumber',
      cell: (info) => <span className="font-mono text-xs text-slate-500">{info.getValue() || '—'}</span>
    },
    {
      header: 'Category',
      accessorKey: 'categoryId',
      cell: (info) => <span className="text-slate-700 font-medium">{info.getValue() ? info.getValue().name : 'N/A'}</span>
    },
    {
      header: 'Site Location',
      accessorKey: 'siteId',
      cell: (info) => <span className="text-slate-700 font-medium">{info.getValue() ? info.getValue().name : 'N/A'}</span>
    },
    {
      header: 'Status',
      accessorKey: 'lifecycleStatus',
      cell: (info) => <StatusBadge status={info.getValue()} />
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/assets/${info.row.original._id}`)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-brand-500 transition-colors border border-slate-200"
            title="360° View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Central Asset Register</h1>
          <p className="text-xs text-slate-500 font-medium">Authoritative fixed asset repository across all corporate entities</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/assets/new')} className="btn-primary">
            <Plus className="w-4 h-4" /> Register New Asset
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search ID, Tag, Serial, Description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Filter className="w-4 h-4 text-brand-500" /> Showing active register items
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading Asset Register...</div>
      ) : (
        <DataTable
          columns={columns}
          data={assets}
          pagination={pagination}
          onPaginationChange={(page) => fetchAssets(page)}
        />
      )}
    </div>
  );
}

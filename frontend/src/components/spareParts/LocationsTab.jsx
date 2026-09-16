import React from 'react';
import { MapPin, Building, Box } from 'lucide-react';

export function LocationsTab({ onShowToast }) {
  const warehousesList = [
    { name: 'Main Warehouse - Dubai HQ', code: 'WH-HQ-01', totalBins: 450, occupiedBins: 380, occupancyPct: 84, manager: 'John Doe', categories: 'HVAC, Electrical, Plumbing' },
    { name: 'Electrical Store - HQ', code: 'WH-HQ-02', totalBins: 200, occupiedBins: 165, occupancyPct: 82, manager: 'Sarah Ahmed', categories: 'Electrical' },
    { name: 'Plumbing Bay - HQ', code: 'WH-HQ-03', totalBins: 150, occupiedBins: 110, occupancyPct: 73, manager: 'Ramesh Nair', categories: 'Plumbing' },
    { name: 'Safety Store - HQ', code: 'WH-HQ-04', totalBins: 100, occupiedBins: 75, occupancyPct: 75, manager: 'Ahmed Khan', categories: 'Fire & Safety' },
    { name: 'Site B Facility Store', code: 'WH-ST-02', totalBins: 300, occupiedBins: 210, occupancyPct: 70, manager: 'Tariq Mansoor', categories: 'General' }
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-2xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Storage Locations & Bin Mapping
          </h2>
          <p className="text-[11px] text-slate-500">
            Warehouse layout, aisle/shelf/bin binning codes, and capacity occupancy tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehousesList.map(wh => (
            <div key={wh.code} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-blue-600 font-bold">{wh.code}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{wh.name}</h3>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Bin Occupancy:</span>
                  <span className="font-bold text-slate-900 font-mono">{wh.occupiedBins} / {wh.totalBins} Bins ({wh.occupancyPct}%)</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${wh.occupancyPct}%` }}
                  />
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Warehouse Lead:</span>
                  <span className="font-semibold text-slate-800">{wh.manager}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Categories:</span>
                  <span className="font-medium text-slate-800">{wh.categories}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => onShowToast(`Inspecting Bins in ${wh.code}`)}
                  className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-md text-xs font-semibold transition-colors"
                >
                  View Bins Layout
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

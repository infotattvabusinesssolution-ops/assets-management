with open('frontend/src/pages/AssetList.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setOpenActionMenuId(null);
                                      const assetKey = asset.assetId || asset.id;
                                      navigate(`/movements/transfer?assetId=${encodeURIComponent(assetKey)}`, {
                                        state: { assetId: assetKey, asset }
                                      });
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all cursor-pointer"
                                  >
                                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#6C2BD9]" /> Transfer Location / Site
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setOpenActionMenuId(null);
                                      setTransferModalAsset({
                                        ...asset,
                                        id: asset.id,
                                        assetNumber: asset.assetId || asset.tagNumber || asset.id,
                                        assetName: asset.name || asset.description || asset.assetId,
                                        currentLocation: asset.locationStr || `${asset.siteName || 'Dubai HQ'} > ${asset.buildingName || 'Building A'} > ${asset.floorRoom || 'GF'}`,
                                        assignedTo: asset.custodianName || 'Unassigned'
                                      });
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50/70 hover:bg-purple-100 rounded-xl transition-all cursor-pointer"
                                  >
                                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#6C2BD9]" /> Quick Move / Assign (Popup Modal)
                                  </button>"""

replacement = """                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setOpenActionMenuId(null);
                                      const assetKey = asset.assetId || asset.id;
                                      navigate(`/movements/transfer?assetId=${encodeURIComponent(assetKey)}`, {
                                        state: { assetId: assetKey, asset }
                                      });
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-purple-50 hover:text-[#6C2BD9] rounded-xl transition-all cursor-pointer"
                                  >
                                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#6C2BD9]" /> Transfer Location / Site
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setOpenActionMenuId(null);
                                      setTransferModalAsset({
                                        ...asset,
                                        id: asset.id,
                                        assetNumber: asset.assetId || asset.tagNumber || asset.id,
                                        assetName: asset.name || asset.description || asset.assetId,
                                        currentLocation: asset.locationStr || `${asset.siteName || 'Dubai HQ'} > ${asset.buildingName || 'Building A'} > ${asset.floorRoom || 'GF'}`,
                                        assignedTo: asset.custodianName || 'Unassigned'
                                      });
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                                  >
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Quick Move (In-Page Modal)
                                  </button>"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open('frontend/src/pages/AssetList.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: AssetList.jsx updated successfully!")
else:
    print("ERROR: Target chunk not found in AssetList.jsx")

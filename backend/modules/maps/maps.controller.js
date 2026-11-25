export async function getFloorMaps(req, res, next) {
  res.json({ success: true, maps: [] });
}

export async function getFloorMapByFloor(req, res, next) {
  res.status(404).json({ success: false, message: 'Floor maps have been decommissioned.' });
}

export async function createFloorMap(req, res, next) {
  res.status(400).json({ success: false, message: 'Floor maps have been decommissioned.' });
}

export async function setAssetPosition(req, res, next) {
  res.status(400).json({ success: false, message: 'Asset floor mapping has been decommissioned.' });
}

export async function locateAssetOnMap(req, res, next) {
  res.status(404).json({ success: false, message: 'Floor maps have been decommissioned.' });
}

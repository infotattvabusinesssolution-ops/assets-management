import { Router } from 'express';
import {
  getFloorMaps,
  getFloorMapByFloor,
  createFloorMap,
  setAssetPosition,
  locateAssetOnMap
} from './maps.controller.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', getFloorMaps);
router.get('/floor/:floorId', getFloorMapByFloor);
router.post('/', createFloorMap);
router.post('/position', setAssetPosition);
router.get('/locate/:assetId', locateAssetOnMap);

export default router;

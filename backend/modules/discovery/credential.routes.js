import express from 'express';
import { createCredential, getCredentials, deleteCredential } from './credential.controller.js';

const router = express.Router();

router.post('/', createCredential);
router.get('/', getCredentials);
router.delete('/:id', deleteCredential);

export default router;

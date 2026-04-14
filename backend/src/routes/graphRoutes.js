import express from 'express';
import { saveGraph, getMyGraphs, getGraphByShortId, updateGraph, deleteGraph } from '../controllers/graphController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, saveGraph);
router.put('/:shortId', protect, updateGraph);
router.delete('/:shortId', protect, deleteGraph);
router.get('/my-graphs', protect, getMyGraphs);
router.get('/shared/:shortId', getGraphByShortId);

export default router;

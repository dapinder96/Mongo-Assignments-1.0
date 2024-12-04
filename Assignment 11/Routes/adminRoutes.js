import express from 'express';
const router = express.Router();
import {adminRead} from '../controllers/taskControllers.js';
import {authenticateToken} from '../utils.js';

router.route('/getTasks')
    .get(authenticateToken,adminRead);

export default router;
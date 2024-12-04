import express from 'express';
const router = express.Router();
import {authenticateToken} from '../utils.js';
import {createTask,readTasks,updateTask,softDelete,updateTaskStatus} from '../controllers/taskControllers.js';

router.route('/')
    .get(authenticateToken,readTasks)
    .post(authenticateToken,createTask);

router.route('/:id')
    .put(authenticateToken,updateTask)
    .patch(authenticateToken,updateTaskStatus)
    .delete(authenticateToken,softDelete);

export default router;
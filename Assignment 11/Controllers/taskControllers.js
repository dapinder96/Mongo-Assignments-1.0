import Task from '../models/taskModel.js'; 
import userModel from '../models/userModel.js';
import httpStatus from 'http-status-codes';

const createTask = async (req, res) => {
    try {
        const { _id } = req.user;
        const { title, description } = req.body;

        const user = await userModel.findById(_id);
        if (!user) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const task = new Task({
            userId: _id,
            title,
            description: description || undefined, // Only include description if provided
        });

        await task.save();
        user.tasks.push(task._id);
        await user.save();
        res.status(httpStatus.CREATED).json({
            success: true,
            message: "Task created successfully",
            task,
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while creating the task",
            error: error.message,
        });
    }
};

const readTasks = async (req, res) => {
    try {
        const { _id } = req.user;
        const { page = 1, limit = 5, title, description } = req.query;

        if (isNaN(page) || page <= 0) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Invalid page number. It must be a positive integer.",
            });
        }

        if (isNaN(limit) || limit <= 0) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Invalid limit value. It must be a positive integer.",
            });
        }

        const filter = { deleted: false };
        if (title) {
            filter.title = title; 
        }
        if (description) {
            filter.description = description;
        }

        const user = await userModel.findById(_id).populate({
            path: 'tasks',
            match: filter,
            options: {
                sort: { createdAt: -1 },
                skip: (page - 1) * limit,
                limit: parseInt(limit),
            },
        });

        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: "User not found",
            });
        }

        const totalTasks = await Task.countDocuments({ 
            userId: _id, 
            ...filter, 
        });

        res.status(httpStatus.OK).json({
            success: true,
            tasks: user.tasks,
            pagination: {
                totalTasks,
                totalPages: Math.ceil(totalTasks / limit),
                currentPage: Number(page),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while fetching tasks.",
            error: error.message,
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const { _id } = req.user;
        const taskId = req.params.id; 
        const { title, description } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: "Task not found.",
            });
        }

        if (task.userId.toString() !== _id) {
            return res.status(httpStatus.FORBIDDEN).json({
                success: false,
                message: "You can only update your own tasks.",
            });
        }

        task.title = title || task.title;  
        task.description = description || task.description;  

        await task.save();

        return res.status(httpStatus.OK).json({
            success: true,
            message: "Task updated successfully.",
            task,
        });
    } catch (error) {
        console.error(error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while updating the task.",
            error: error.message,
        });
    }
};

const softDelete = async (req,res) => {
    try {
        const { _id } = req.user;
        const taskId = req.params.id; 

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: "Task not found.",
            });
        }

        if (task.userId.toString() !== _id) {
            return res.status(httpStatus.FORBIDDEN).json({
                success: false,
                message: "You can only update your own tasks.",
            });
        }

        task.deleted = true;
        await task.save();

        return res.status(httpStatus.OK).json({
            success: true,
            message: "Task deleted successfully.",
            task,
        });

    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while deleting the task.",
            error: error.message,
        });
    }
}

const adminRead = async (req,res) => {
    try {
        const {_id} = req.user;
        const {page = 1} = req.query;
        const limit = 5;
        const user = await userModel.findById(_id);
        if(!user){
            return res.status(httpStatus.BAD_REQUEST).json({success:false, message:"Invalid user ID"});
        }
        if(!user.isAdmin){
            return res.status(httpStatus.FORBIDDEN).json({success:false,message:"you do not have authorization to perform this action"});
        }
        const allTask = await Task.find().skip((page - 1) * limit).limit(limit);
        const totalTasks = await Task.countDocuments();
        return res.status(httpStatus.OK).json({success:true,
            message:"tasks fetched successfully",
            allTask,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: page,
        });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while fetching tasks.",
            error: error.message,
        });
    }
}

const updateTaskStatus = async (req,res) => {
    try {
        const { _id } = req.user;
        const taskId = req.params.id; 
        const {status} = req.body;

        const user = await userModel.findById(_id);
        if (!user) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: "Task not found.",
            });
        }

        if (task.userId.toString() !== _id) {
            return res.status(httpStatus.FORBIDDEN).json({
                success: false,
                message: "You can only update your own tasks.",
            });
        }

        const validStatus = ['Pending', 'In Progress', 'Completed'];
        if(!validStatus.includes(status)){
            return res.status(httpStatus.BAD_REQUEST).json({success:false,message:`invalid status given - ${status}`,validStatus});
        }

        const taskStatus = task.status;
        if( (taskStatus === 'Pending' && status !== 'In Progress') || (taskStatus === 'In Progress' && status !== 'Completed') || taskStatus === 'Completed' ){
            return res.status(httpStatus.BAD_REQUEST).json({success:false,message:`Invalid status update from ${taskStatus} to ${status}`});
        }

        task.status = status;
        await task.save();

        res.status(httpStatus.OK).json({success:true,message:"updated task status successfully",task});

    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while updating the task status.",
            error: error.message,
        });
    }
}

export {createTask,readTasks,updateTask,softDelete,adminRead,updateTaskStatus};


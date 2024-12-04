import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tasks',
        },
    ],
    isAdmin:{
        type:Boolean,
        required:true
    }
});

const userModel = mongoose.model("Users", userSchema);

export default userModel;

import mongoose from 'mongoose';

async function connectDb(url) {
    return mongoose.connect(url);
}

export default connectDb;
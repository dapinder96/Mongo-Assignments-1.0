import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5555;
const URL = process.env.MONGO_URL || "mongodb+srv://dakshchawla:doctorDaksh@techhaven.bgq6j.mongodb.net/Assignment";

import authRoute from './routes/authRoutes.js';
import taskRoute from './routes/taskRoutes.js';
import adminRoute from './routes/adminRoutes.js';

import connectDb from './dbConnect.js';
connectDb(URL)
.then(()=>{
    console.log("connected to database");
    app.listen(PORT,(err)=>{
        if(err) console.log("error connecting to database");
        else console.log(`connected at port ${PORT}` );
    })
})
const app = express();

app.use(express.json());

app.use('/auth',authRoute);
app.use('/task',taskRoute);
app.use('/admin',adminRoute);


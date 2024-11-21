const mongoose=require("mongoose")
const courses = require("./courses")

const studentSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    grade:{
        type:String,
        required:true
    },
    courses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Courses"
    }]
})
module.exports=mongoose.model("Student", studentSchema)

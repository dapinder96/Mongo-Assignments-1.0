const express=require("express")
const router=express.Router()

router.post("/",async(req,res)=>{
    try {
        const {name,age, grade, courses}=req.body
        const nStudent=new Student({name,age,grade,courses})
        const sStudent=await nStudent.save()
        res.status(201).json({data:sStudent})
    } catch (error) {
        res.status(400).json({"err":error})
    }
})
router.get("/",async(req,res)=>{
    try {
        let studentData=await Student.find()
        res.status(200).json({"data":studentData})
    } catch (error) {
        console.log(error)
    }
})

router.get("/:id", async(req,res)=>{
    const {id}=req.params
    try {
        let studentData=await Student.findById(id)
        if (!studentData) return res.status(404).json({ message: "Student not found" });
        res.status(200).json({"data":studentData})
    } catch (error) {
        console.error("Error fetching student:", error);
    }
})

router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, age, marks } = req.body;

    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            id, 
            { name, age, marks },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json({ message: "Student updated successfully", data: updatedStudent });
    } catch (error) {
        console.error("Error updating student:", error);
    }
});


router.delete("/:id", async(req,res)=>{
    const {id}=req.params
    try {
        let studentData=await Student.findByIdAndDelete(id)
        if (!studentData) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.status(200).json({"data":studentData})
    } catch (error) {
        console.error("Error deleting student:", error)
    }
    
})


module.exports=router

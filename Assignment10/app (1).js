const express = require("express");
const mongoose = require("mongoose");
const studentsRouter = require("./routes/students");
const coursesRouter = require("./routes/courses");
const PORT = 3000;

const app = express();

app.use(express.json());

app.use("/students", studentsRouter);
app.use("/courses", coursesRouter);

mongoose
  .connect("mongodb://localhost:27017/university")
  .then(() => {
    console.log("database Connected!");
    app.listen(PORT, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Listening on PORT ${PORT}`);
      }
    });
  })
  .catch((err) => console.log(err));

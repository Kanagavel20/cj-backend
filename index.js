const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
const dataBase = require("./src/config/db")
const indexRoutes = require("./src/routes/routes")
const cors = require('cors')

dataBase();

app.use(express.json())
app.use(cors())

app.use('/',indexRoutes)

app.listen(port,()=>{
     console.log(`Server running on port ${port}`);
})
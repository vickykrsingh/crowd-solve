import dotenv from 'dotenv';

// Load environment variables as early as possible
dotenv.config();

import app from "./api/index.js";

app.listen(8080,(req,res)=>{
    console.log("server is running on the port 8080");
})
import express from "express";
import books from "./router/data.js";
import router from "./router/auth.js";
// import login from "./router/auth.js";

const port = 9000;

const app = express();
app.use(express.json());

app.use("/auth",router);


app.get("/",(req,res)=>{
    res.send(books);
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})
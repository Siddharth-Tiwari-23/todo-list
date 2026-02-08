import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const publicPath = path.join(__dirname, 'public');

app.use(express.static(publicPath));
app.set("view engine",'ejs')


app.get("/",(req,resp)=>{
    resp.render("list")
})

app.get("/add",(req,resp)=>{
    resp.render("add")
})

app.get("/update",(req,resp)=>{
    resp.render("update")
})

app.post("/update",(req,resp)=>{
    resp.render("update")
})

app.post("/add",(req,resp)=>{
    resp.render("update")
})

app.listen(3200);

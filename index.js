let express=require("express");

require("dotenv").config();

let cookieparser=require("cookie-parser")
let app=express();

let cors=require("cors");
let {PORT_NO}=process.env;
// connect("mongodb://127.0.0.1:27017/user");


app.use(cors());
app.use(express.json()); 
app.use(cookieparser())
// ------------main routes---------------
app.get("/", function(req, res){

console.log("new express.request");
res.json({"message":"hello from server"})
})

app.get("/info", function(req, res){

    console.log("new express.request");
    res.json({"message":"this server id deployed by tushar bansal"})
    })
    


app.listen(PORT_NO,()=>console.log("express run at port no :"+PORT_NO));

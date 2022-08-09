// required modules
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

// use and settings of modules
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// mongoose connections
mongoose.connect("mongodb://localhost:27017/moneyDB", { useNewUrlParser: true });

const moneySchema = new mongoose.Schema({
    dateTime: String,
    amountFor: String,
    amount: Number
});
const List = new mongoose.model("List", moneySchema);
app.get("/", function (req, res) {
    List.find(function (err, lists) {
        if (err) { 
            console.log(err)
        }else{
            let sum = 0;
            lists.forEach(function(item){
                sum = sum + item.amount ;
            })
            res.render("home", {moneyHisab:lists, sumTotal:sum});
        }
    })
})



app.post("/", function (req, res) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let today = new Date();
    let hour;
    let timeNow;
    if (today.getHours() > 12) {
        hour = today.getHours() - 12
        timeNow = months[today.getMonth()] + " " + today.getDate() +", " + hour + ":" + today.getMinutes() + " PM";
    } else {
        hour = today.getHours();
        timeNow = months[today.getMonth()] + " " + today.getDate() + ", " + hour + ":" + today.getMinutes() + " AM";
    }
    const newList = new List({
        dateTime: timeNow,
        amountFor: req.body.amountfor,
        amount: req.body.amount
    });
    newList.save();
    res.redirect("/");
});
// console.log(today);
// console.log(months[today.getMonth()]);
// console.log(today.getDate());
// console.log(today.getHours());
// console.log(today.getMinutes());
// console.log(today.getSeconds());
app.post("/delete", function(req,res){
    const deletedItem = req.body.deleteItem ;
    List.deleteOne({_id:deletedItem},function(err){
        if(err){
            console.log(err)
        }else{
            res.redirect("/");
        }
    })
})





app.listen(3000, function () {
    console.log("Server started at 3000 port for money tracking");
})
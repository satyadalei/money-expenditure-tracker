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

// const allUserSchema = new mongoose.Schema({
//     fname : String,
//     lname: String,
//     email: String,
//     password: String
// })

// const individualSchema = new mongoose.Schema({
//     month: String,
//     dateTime: String,
//     amountFor: String,
//     amount: Number
// });
const moneySchema = new mongoose.Schema({
    fname : String,
    lname: String,
    email: String,
    password: String,
    moneyTrack: Array
});
const List = new mongoose.model("List", moneySchema);
app.get("/", function (req, res) {
    res.render("home")
    // List.find(function (err, lists) {
    //     if (err) { 
    //         console.log(err)
    //     }else{
    //         let sum = 0;
    //         lists.forEach(function(item){
    //             sum = sum + item.amount ;
    //         })
    //         res.render("home", {moneyHisab:lists, sumTotal:sum});
    //     }
    // })
})

app.get("/login",function(req,res){
     res.render("login");
});
app.get("/registration",function(req,res){
    res.render("registration");
});

app.post("/registration", function (req, res) {
    const newList = new List({
        fname : req.body.fname,
        lname: req.body.lname,
        email: req.body.email,
        password: req.body.confirmpsw
    });
    newList.save();
    res.redirect("/login");
});
app.post("/login",function(req,res){
    List.findOne({email:req.body.email},function(err,foundUser){
        if(err){
            console.log(err)
        }else{
            if(!foundUser){
                res.send("This user does not exists")
            }else{
                res.render("individual",{user:foundUser})
            }
        }
    })
});
app.post("/userDataSave", function(req,res){
    const requestedID = req.body.user_id.trim() ;
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
    List.findOne({_id:requestedID},function(err, foundUser){
       if(err){
        console.log(err);
       }else{
        if(foundUser){
            const foundUserIndividual = foundUser;
            const userInputData = {
                dateTime: timeNow ,
                amountFor: req.body.amountfor,
                amount: req.body.amount
            }
            foundUserIndividual.moneyTrack.push(userInputData);
            foundUserIndividual.save();
            // find and render individual page data
            List.findOne({_id:requestedID},function(err,found_user){
                if(err){
                    console.log(err)
                }else{
                    if(!found_user){
                        res.send("This user does not exists")
                    }else{
                        res.render("individual",{user:found_user})
                    }
                }
            });
        }
       }
    })
})
app.post("/delete", function(req,res){
    const ItemID = req.body.ItemID.trim() ;
    const deletedItemIndex = req.body.deleteItemIndex ;
    List.findOne({_id:ItemID},function(err,foundItem){
        if(err){
            console.log(err)
        }else{
             if(foundItem){
                const itemData = foundItem ;
                itemData.moneyTrack.splice(deletedItemIndex)
                itemData.save()
                // find and render individual page data
                List.findOne({_id:ItemID},function(err,foundUser){
                    if(err){
                        console.log(err)
                    }else{
                        if(!foundUser){
                            res.send("This user does not exists")
                        }else{
                            res.render("individual",{user:foundUser})
                        }
                    }
                });
             }
        }
    });
    // List.deleteOne({_id:deletedItemID},function(err){
    //     if(err){
    //         console.log(err)
    //     }else{
    //         res.redirect("/");
    //     }
    // })
})




// console.log(today);
// console.log(months[today.getMonth()]);
// console.log(today.getDate());
// console.log(today.getHours());
// console.log(today.getMinutes());
// console.log(today.getSeconds());
app.listen(3000, function () {
    console.log("Server started at 3000 port for money tracking");
})
// required modules
const dotenv = require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const _ = require("lodash");

// mongoose connections
const mongodb_url = process.env.MONGO_DB_URL;
const mongodbOptions = { useNewUrlParser: true };
mongoose.connect(mongodb_url, mongodbOptions)
// .then(function(){
//     console.log("MongoDB database is connected successfully");
// });

// use and settings of modules
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(session({
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    store: mongoStore.create({
        mongoUrl: mongodb_url,
        collectionName: "myAllSession"
    }),
    cookie:{
        maxAge: 1000*60*60*24*7 // 1 Week expairy date // 1000=1sec, 1000*60 = 1min , 1000*60*60 = 1hr ,1000*60*60*24*7 = 1 week  
        // cookies will be stored for one week and then automatically deleted.
    } 
}));

const moneySchema = new mongoose.Schema({
    fname : String,
    lname: String,
    email: String,
    password: String,
    moneyTrack: Array
});

const List = new mongoose.model("List", moneySchema);

// *****DONOT CHANGE  below***** these are messages and will be used for different condition 
const regis_LinkUUrl = "/registration" ;
const login = "/login" ;
const combinedUrl = "<a href="+regis_LinkUUrl +"> Registration </a>"+ "Or" +
                    "<a href="+ login +"> Login </a>" ;
//*****DONOT CHANGE above*****

app.get("/", function (req, res) {
    if(req.session.isAuth === true){
        List.findOne({_id:req.session.user_ID},function(err,foundUser){
            if(err){
                console.log(err)
            }
            else{
                if(foundUser){
                    res.redirect(`/${_.lowerCase(foundUser.fname)}`);
                }else{
                    res.render("home");
                }
            }
        })
    }else{
        res.render("home");
    }
})

app.get("/login",function(req,res){
     res.render("login");
});
app.get("/registration",function(req,res){
    res.render("registration");
});
app.get("/:user", function(req,res){
    if(req.session.isAuth === true){
    const userId = req.session.user_ID;
    List.findOne({_id:userId},function(err,foundUser){
        if(err){
            console.log(err)
        }else{
            if(foundUser){
                //const found_User = JSON.parse(foundUser) ;
                let sum = 0 ;
                foundUser.moneyTrack.forEach(function(item){
                sum = sum + parseFloat(item.amount, 2);
                // parseInt(item.amount)
                });
                res.render("individual", {user:foundUser, sumTotal:sum});
            }
        }
    });              
    }else{
        res.redirect("/login");
    }
});
app.post("/registration", function (req, res) {
    const userFname = _.capitalize(req.body.fname)  ;
    const userLname = _.capitalize(req.body.lname) ;
    const userEmail = req.body.email ;
    const userPassword =  req.body.confirmpsw ;
    List.findOne({email:userEmail},function(err,foundUser){
        if(err){
            console.log(err)
        }else{
            if(foundUser){
                // this will send client a message that same mail id already exists and provide link to login or signin
                const messageString = "<h1>This user with same mail_ID already exists. Please try another one.</h1>" ;
                res.send(messageString + combinedUrl);
            }else{
                bcrypt.hash(userPassword, saltRounds, function(err,hashedPassword){
                    if(err){console.log(err)}else{
                        newList = new List({
                            fname : userFname,
                            lname: userLname,
                            email: userEmail,
                            password: hashedPassword
                        });
                        newList.save(function(err,savedUser){
                            if(err){
                                console.log(err)
                            }else{
                                req.session.user_ID = savedUser._id;
                                req.session.isAuth = true ;
                                res.redirect(`/${_.lowerCase(savedUser.fname)}`);
                            }
                        });
                    }
                })
            }
        }
    });  
});
app.post("/login",function(req,res){
    const userEmail = req.body.email ;
    const userPassword = req.body.psw ;
    List.findOne({email:userEmail},function(err,foundUser){
        if(err){
            console.log(err)
        }else{
            if(!foundUser){
                const messageString = "<h1>This user does not exists</h1>" ;
                res.send(messageString + combinedUrl);
            }else{
                bcrypt.compare(userPassword, foundUser.password , function(err, passwordConfirmed) {
                    if(err){console.log(err)}else{
                        if(passwordConfirmed === true){
                            req.session.isAuth = true ;
                            req.session.user_ID = foundUser._id ;
                            res.redirect(`/${_.lowerCase(foundUser.fname)}`);
                        }else{
                            const messageString = "<h1>You have enterd the wrong password" ;
                            res.send(messageString + combinedUrl);
                        }
                    }
                });
            }
        }
    });
});
app.post("/userDataSave", function(req,res){
    const requestedID = req.body.user_id.trim() ;
    const months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Decr"];
    let today = new Date();
    let hour;
    let timeNow;
    if(today.getHours() > 12){
        hour = today.getHours() - 12
        timeNow = months[today.getMonth()] + " " + today.getDate() +", " + hour + ":" + today.getMinutes() + " PM";
    }else{
        hour = today.getHours();
        timeNow = months[today.getMonth()] + " " + today.getDate() + ", " + hour + ":" + today.getMinutes() + " AM";
    };
    if(req.session.isAuth === true){
        List.findOne({_id:requestedID}, async function(err, foundUser){
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
                 await foundUserIndividual.moneyTrack.push(userInputData);
                 foundUserIndividual.save(function(err,savedUser){
                     if(err){
                         console.log(err)
                     }else{
                         if(savedUser){
                             res.redirect(`/${_.lowerCase(savedUser.fname)}`);
                         }
                     }
                 });
             }
            }
         });
    }else{
        res.redirect("/login");
    }
});
app.post("/delete", function(req,res){
    const ItemID = req.body.ItemID.trim() ;
    const deletedItemIndex = req.body.deleteItemIndex ;
    if(req.session.isAuth === true){
        List.findOne({_id:ItemID}, async function(err,foundItem){
            if(err){
                console.log(err)
            }else{
                if(foundItem){
                    const itemData = foundItem ;
                    await itemData.moneyTrack.splice(deletedItemIndex,1);
                    itemData.save(function(err,savedUserData){
                        if(err){
                            console.log(err);
                        }else{
                            if(savedUserData){
                                res.redirect(`/${_.lowerCase(savedUserData.fname)}`);
                            }
                        }
                    });
                }
            }
        });
    }else{
        res.redirect("/login");
    }
});
app.post("/logout", function(req,res){
    if(req.session.isAuth === true){
        req.session.destroy(function(err){
            if(err){console.log(err)}else{
             res.redirect("/");
            }
         });
    }else{
        res.redirect("/login");
    }
});




app.listen(3000, function () {
    console.log("Server started at 3000 port for money tracking");
});
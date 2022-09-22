const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const { userInfo } = require("os");
const mongoDb = "mongodb://localhost:27017/myapp";
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

let Useros

const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },    permision: { type: String, required: true }



  })
);


let messages =[]


const Message = mongoose.model(
    "Messages",
    new Schema({
      title: { type: String, required: true },
      text: { type: String, required: true },
      username:{ type: String, required: true }

  
  
    })
  );


  Message.find({},(req,res)=>{
    
    messages = res
   
    })

const app = express();

app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));

passport.use(
    new LocalStrategy((username, password, done) => {
      User.findOne({ username: username }, (err, user) => {
        if (err) { 
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
                Useros = user// passwords match! log user in
              return done(null, user)

            } else {
              // passwords do not match!
              return done(null, false, { message: "Incorrect password" })
            }
          })
  
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
  });




passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});




function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/log-in')
  }


  app.use(express.static("views"))


app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get("/",checkAuthenticated, (req, res) => res.render("index"));
app.get("/sign-up", checkNotAuthenticated,(req, res) => res.render("sign-up-form"));



app.post("/sign-up", (req, res, next) => {
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {

User.findOne({username:req.body.username},(err,response)=>{
    if(response !== null){
        res.render("sign-up-form")
    }else{
        const user = new User({
            username: req.body.username,
            password: hashedPassword,email:req.body.email,permision:"user"
          }).save(err => {
            if (err) { 
              return next(err);
            }
            res.redirect("/log-in");
          });
    }
})

       
      });
   
  });



  app.post(
    "/log-in",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/log-in"
    })
  );
app.get("/log-in",checkNotAuthenticated,(req,res)=>{
    res.render("log-in")
})
app.get("/log-out", (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });


  
app.get("/createMessage",checkAuthenticated,(req,res)=>{
    res.render("messageCreateForm")
})


app.post("/createMessage",(req,res)=>{
let newMessage = new Message({
    title:req.body.title,
text:req.body.text,
username:Useros.username
})
messages.push(newMessage)
newMessage.save()
res.redirect("/")


})

app.get("/getMessages",(req,res)=>{
res.json({messages,Useros})

})
app.post("/messageDelete/:id",(req,res)=>{
Message.findOneAndDelete({_id:req.params.id},(err,response)=>{
  console.log(response)

let newMessages = []

messages.forEach((message)=>{
  let  id = message._id.toString().slice(0,24)
  if(id !==req.params.id){
    
    console.log(message._id)
    newMessages.push(message)
  }
})

messages = newMessages

})

})

app.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/sign-in");
  });
});



  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }

app.listen(3000, () => console.log("app listening on port 3000!"))
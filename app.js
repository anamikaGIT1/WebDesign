var express = require("express");
var bodyParser = require('body-parser')
var mongoose = require('mongoose');
//const bcrypt = require("bcrypt");



//Set up default mongoose connection
var mongoDB = 'mongodb://127.0.0.1/my_database';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


var app = express();
  app.listen(3000, () => {
      console.log("Server running on port 3000");
  });


var Schema = mongoose.Schema;

var UserSchema = new Schema({
  FullName: {
    type:   String,
    unique: true,
    required: 'Full Name is required'
  },
  Email: {
    type:   String,
    unique: true,
    required: 'Email address is required',
    match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  Password: {
    type: String,
    min: [6],
    max: 12,
    required: [true, 'Password too weak'],
    match : [/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/, 'Password Should Include 1 upper case and 1 special character']

 }
});


var UserModel = mongoose.model('UserModel', UserSchema);

app.put("/user/edit", bodyParser.json(), async (req,res) => {

  const filter = { Email : req.body.Email };
const update = { Password: req.body.Password, FullName: req.body.FullName };

try{
  var Email = await UserModel.findOne(filter);
  let doc = await UserModel.findOneAndUpdate(filter, update);
doc = await UserModel.findOne(filter);
res.status(200);
res.json(doc);
}
catch(Error){
  res.status(400);
}
})

app.post("/user/create", bodyParser.json(), async (req, res) => {
    
    console.log(req.body.Email)
    var User_instance = new UserModel(req.body);
    let errorr = User_instance.validateSync()

    if(errorr){
      if (errorr.name == 'ValidationError') {
        for (field in errorr.errors) {
            console.log("** ",errorr.errors[field].message); 
            res.status(400)
            res.send(errorr.errors[field].message)
            return
        }
      }
    }

  
    UserModel.count({"Email": req.body.Email}, function (err, count){ 
      if(count>0){
          res.status(400)
          res.send("Email ID already exists")
          return
      }else{
        User_instance.save(function (err) {
          if (err)  {
            console.log("Error ",err)
            if(err.name == "MongoError"){
              console.log("Du")
            }
          }
          else{
            res.send("Success")
            
            console.log("Success")
            
          }
        });
      }

    }); 
     
   });

   
  


   app.get("/user/getAll",bodyParser.json(),(req, res) =>{
    console.log("GetAll called")

    UserModel.find({},(err, Users)=>{
      if(err){
        res.status(400)
        res.send(err)
      }
      else
        res.send(Users)
    })
      
   })


   app.delete("/user/delete", bodyParser.json(), (req, res) =>{

      console.log("Delete called")
      UserModel.find({"Email": req.body.Email},(err, Users)=>{
        if(err)
          res.send(err)
        if (Users.length ==0){
          res.send("User Email not found in the database. Enter valid user details")
          return;
        }else{
          UserModel.findOneAndDelete({"Email": req.body.Email}, function(err,Users){

            if(err){
              res.status(400)
              res.send(err)
             
            }else{
              UserModel.find({},(err, Users)=>{
                if(err)
                  res.send(err)
                else
                  res.send("User Deleted Successfully")
              })
            }
          })
        }
          
      })

     

   })
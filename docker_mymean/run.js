
var express = require('express');  
var bodyParser = require('body-parser'); 
var ejs = require('ejs');
var MongoClient = require('mongodb').MongoClient;
var app = express();  
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const path = require('path')

/*********Get Cloud Foundry credentials to connect mongodb*************/ 
var vcapServices = require('vcap_services');
let url;
var credentials = vcapServices.getCredentials('mlab');
url=credentials.uri;
//If Cloud Foundry credentials are not available then ***********//
//get local DOCKER running mongo server credintials ************//

if (url==null){
  url="mongodb://mongo:27017/mynewdb";}

// Connect to the db 
MongoClient.connect(url, function (err, db) {

 if(!err) {
    console.log("Connected to BookMyShow Database");

app.use(express.static('public')); //making public directory as static directory  
app.use(bodyParser.json());

app.get('/', function (req, res) {  
   console.log("Got a GET request for homepage");  
   res.send('<h1>HelloWorld!</h1>');  
})

app.get('/index.html', function (req, res) {  
   res.sendFile( __dirname + "/" + "index.html" );    
})  

app.get('/insert.html', function (req, res) {
    res.sendFile( __dirname + "/" + "insert.html" );
})

//...............Authenticaltion........................................................
app.get("/authenticate", function(req, res) {
 
 var username = req.query.usr;
 var password = req.query.pwd;

   if((username == "bookmyshow")&&(password == "open1234")) {
    res.sendFile(path.join(__dirname, 'public','main.html'));
   } 
   else {
    res.sendFile(path.join(__dirname, 'public','index.html'));
   }
 });

/* to access the posted data from client using request body (POST) or request params(GET) */
//-----------------------POST METHOD-------------------------------------------------
app.post('/process_post', function (req, res) {
    /* Handling the AngularJS post request*/
    console.log("Inserted Succesfully: "+JSON.stringify(req.body));
  res.setHeader('Content-Type', 'text/html');
    /*response has to be in the form of a JSON*/
    req.body.serverMessage = "Added Succesfully"
    /*adding a new field to send it to the angular Client */
    //console.log("Sent data are (POST):usn :"+req.body.usn+"  name="+req.body.name+"cgpa:"+req.body.cgpa+"12th per"+req.body.per+"backlog"+req.body.bck+"semester"+req.body.sem+"extra curicular"+req.body.exc);
    // Submit to the DB
    var Eno = parseInt(req.body.Eno);
    var Ename = req.body.Ename;
    var loc = req.body.loc;
    var date = req.body.date;
  db.collection('Event').insert({Eno:Eno,Ename:Ename,loc:loc,date:date});
    res.end("Your ticket has been purchased succesfully");
    /*Sending the respone back to the angular Client */
});


//--------------UPDATE------------------------------------------
app.get("/update", function(req, res) {
  var Eno = parseInt(req.query.Eno);
  var date = req.query.date
 
  db.collection('Event', function (err, data) {
        data.update({"Eno": Eno} , {$set:{"date": date}},{multi:true},
            function(err, result){
        if (err) {
          console.log("Failed to update data.");
      } else {
        res.send(result);
        console.log("Event Time Updated")
      }
        });
    });
})  

//...............search........................................................
app.get("/search", function(req, res) {
  
  var Eno = parseInt(req.query.Eno);
    db.collection('Event').find({"Eno":Eno}).toArray(function(err, docs) {
    if (err) {
      console.log(err.message+ "Failed to get data.");
    } else {
      res.status(200).json(docs);
    }
  });
  });
   
//--------------DELETE------------------------------------------//
app.get("/delete", function(req, res) {
 
  var Eno = parseInt(req.query.Eno);
  db.collection('Event', function (err, data) {
        data.remove({"Eno" : Eno}, function(err, result){
        if (err) {
          console.log("Failed to remove data.");
      } else {
        res.send(result);
        console.log("Ticket Deleted for Event no -> "+Eno)
      }
        });
    });
    
  });

app.get('/display', function (req, res) { 

//-------------DISPLAY USING EMBEDDED JS -----------
db.collection('Event').find().sort({Eno:1}).toArray(
    function(err , i){
        if (err) return console.log(err)
        res.render('disp.ejs',{Event: i})  
     })
}) 

app.get('/help', function (req, res) {  
   console.log("Got a GET request for /help");  
   res.send('BookMyShow can help you find tickets on literally anything you wish for!');  
})  
 
var server = app.listen(8080, function () {    
var port = server.address().port  
console.log("listening on http://localhost:%s/", port)  
})  
}
else
{ 
  console.log("Failed to connect to Database");  
  db.close();  
}
});

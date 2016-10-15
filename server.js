var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb').MongoClient;
var URL = process.env.MONGODB_URI || "mongodb://localhost:27017/local";
var port = process.env.PORT || 8080;

var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/new/:url(https?:\/\/[\da-z\.-]+\.[a-z\.]{2,6}\/?)', function (req, res) {
    console.log("Got request with site: " + req.params.url);
    var site_id = generateSiteId();
    updateSiteId(site_id, req.params.url);
    res.end(site_id.toString());
});

app.get('/:id', function (req, res) {
    console.log(req.params.id);
    redirectToSite(req.params.id, res);
});



app.listen(port, function () {
  console.log('Example app listening on port ' + port);
});

var max_site_id = 0;

function generateSiteId() {
    max_site_id = max_site_id + 1;
    return max_site_id;
}

function updateSiteId(id, site) {
    mongo.connect(URL, function(err, db) {
      // db gives access to the database
      if(err) return console.log(err);
      console.log("updateSiteId: Connected to db");
      var collection = db.collection('sites');
      collection.insert({id:id, site:site}, function(err, data) {
          if(err) return console.log(err);
          console.log("written: " + JSON.stringify(data));});
      db.close();
});
}

function redirectToSite(id, res) {
    mongo.connect(URL, function(err, db) {
      // db gives access to the database
      if(err) return console.log(err);
      console.log("redirectToSite: Connected to db. id: " + id);
      var collection = db.collection('sites');
      collection.find({id : +id}).toArray(function(err, documents) {
          if(err) return console.log(err);
          if(documents.length > 0) {
            console.log("read: " + JSON.stringify(documents[0].site));
            res.redirect(documents[0].site);
          } else {
              res.end("No site found.");
          }
          });
          
      db.close();
});}

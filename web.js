var express = require('express');
var fs= require('fs');
var path=require('path');

var app = express.createServer(express.logger());

var readFile=function(path){
    var buf=new Buffer(fs.readFileSync(path));
    return buf.toString();
};


app.get('public/images/favicon.ico', function(request, response) {
  response.send(readFile('public/images/favicon.ico'));
});

app.get('/', function(request, response) {
  response.send(readFile('index.html'));
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});

var express = require('express');
var fs= require('fs');

var app = express.createServer(express.logger());

var readFile=function(path){
    var buf=new Buffer(fs.readFileSync(path));
    return buf.toString();
};

app.get('/', function(request, response) {
  response.send(readFile('index.html'));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

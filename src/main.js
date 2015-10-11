var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var http = require('http');
var url = require('url');

/*var url = 'mongodb://localhost:27017/mytvproject';
mongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  db.close();
});*/

function requestHandler(req, res){
	var request = url.parse(req.url, true);
	var patternRoot = /\/{0,1}/;
	if (request.pathname.match()){
		res.writeHead(200, {'Content-Type' : 'text/html'});
		res.end('<h1>Mon zeub</h1>');
	}
}

var server = http.createServer(requestHandler);

server.listen(9999);
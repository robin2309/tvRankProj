/*var http = require('http');

var host = "http://www.kazer.org/tvguide.xml?u=vs2ggbsfp80sa";

function callback(response){
	var str = "";


}

var request = http.get(host, callback);

request.on("error", function (error) {
    console.error(error);
});

request.end();*/

var request = require('request');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;

var hostProgs = "http://www.kazer.org/tvguide.xml?u=vs2ggbsfp80sa";

request(hostProgs, function(error, response, xml) {
	if(error) console.log(error);
	console.log('DOC : ' + xml);
	//var doc = new dom().parseFromString(xml);
    //var nodes = xpath.select("/tv", doc);
	//console.log(nodes[0].localName + ": " + nodes[0].firstChild.data);
    //console.log(nodes);
});
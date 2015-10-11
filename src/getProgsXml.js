var http = require('http');
var select = require('xpath.js');
var dom = require('xmldom').DOMParser;
var fs = require('fs');

var host = "http://www.kazer.org/tvguide.xml?u=vs2ggbsfp80sa";

function insertIntoFile(file, content){
    /*fs.open(file, 'w', function callback(err, fd){
        fs.write(fd, )
    });*/
    fs.writeFile(file, content, function(err){
        if (err) console.log(err);
        console.log('SUCCESS !!');
    });
}

function callback(response) {
    var xml = "";

    response.on("data", function (chunk) {
        xml += chunk;
    });

    response.on("error", function (error) {
        console.error('ERREUR REQUETE : ' + error);
    });

    response.on("end", function () {
        insertIntoFile("programs.xml", xml);
    });
}

var request = http.get(host, callback);

request.on("error", function (error) {
    console.error('ERREUR REQUETE : ' + error);
});

request.end();

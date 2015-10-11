var path = require('path');
var fs = require('fs');
var selectIds = require('xpath.js');
var selectNames = require('xpath.js');
var selectProgs = require('xpath.js');
var dom = require('xmldom').DOMParser;
var util = require('util');
var assert = require('assert');
var mongoClient = require('mongodb').MongoClient;

var filePath = path.join(__dirname, 'programs.xml');

var Channel = function(id, name){
    this.id = id;
    this.name = name;
}

var Channels = function(channels){
    this.channels = channels;
}

Channels.prototype.getName = function(channelId){
    var nameRetrieved = "";
    this.channels.forEach(function(channel){
        if(channel.id === channelId){
            nameRetrieved = channel.name;
        }
    });
    return nameRetrieved;
}

function stringToDate(text){
    return new Date(text.substring(0,4)+ '-' +text.substring(4,6)+ '-' +text.substring(6,8)+ 'T' +text.substring(8,10)+ ':' +text.substring(10,12)+ ':' +text.substring(12,14));
}

function getChannels(xml){
    var doc = new dom().parseFromString(xml);
    var nodeChannelsId = selectIds(doc, "//channel/@id");
    //console.log(nodes[0]);
    var channelsObj = "";
    var channelId = "";
    var channelName = "";
    var channelToAdd = '';
    var channelsRetrieved = [];
    nodeChannelsId.forEach(function(obj, index){
        //console.log(obj.value + "-------->");
        channelId = obj.value;
        nodeChannelsName = selectNames(doc, "//channel[@id='"+ obj.value +"']/display-name/text()")
        //console.log(nodeChannelsName[0].data);
        channelName = nodeChannelsName[0].data;
        channelToAdd =  new Channel(channelId, channelName);
        channelsRetrieved.push(channelToAdd);
    });

    channelsObj = new Channels(channelsRetrieved);
    return channelsObj;
}

function getPrograms(xml, channels){
    var programToAdd = {};
    var programsToAdd = [];
    var doc = new dom().parseFromString(xml);
    var elmtNextSibling;
    var nodeProgs = selectProgs(doc, "//programme");
    nodeProgs.forEach(function(node){
        programToAdd.startDate = stringToDate(node.attributes[0].value);
        programToAdd.endDate = stringToDate(node.attributes[1].value);
        programToAdd.channel = channels.getName(node.attributes[2].value);
        programToAdd.votes = [];
        for(var i=0; i<node.childNodes.length; i++){
            elmtNextSibling = node.childNodes[i].nextSibling;
            if(!(elmtNextSibling === null)){
                switch (elmtNextSibling.nodeName){
                case 'title':
                    programToAdd.name = elmtNextSibling.firstChild.nodeValue.trim();
                    break;
                case 'category':
                    programToAdd.genre = elmtNextSibling.firstChild.nodeValue.trim();
                    break;
                case 'desc':
                    if(elmtNextSibling.firstChild.nodeValue.trim().toLowerCase().indexOf("kazer.org") < 0){
                        programToAdd.description = elmtNextSibling.firstChild.nodeValue.trim().replace("\\", "");
                    } else {
                        programToAdd.description = "";
                    }
                    break;
                case 'length':
                    programToAdd.length = elmtNextSibling.firstChild.nodeValue.trim();
                    break;
                default:
                    break;
                }
            }
        }
        programsToAdd.push(programToAdd);
        programToAdd = {};
    });
    console.log("RECUP :: " + programsToAdd.length);
    return programsToAdd;
}

function readPrograms(filePath){
	fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
		var channels = getChannels(data);
        var programsToInsert = getPrograms(data, channels);
        var url = 'mongodb://localhost:27017/mytvproject';
        mongoClient.connect(url, function(err, db) {
            assert.equal(null, err);
            console.log("INSERTING...");
            db.collection("programs").insertMany(programsToInsert, function(err, response){
                console.log(response);
                assert.equal(programsToInsert.length, response.insertedCount);
                console.log('ROWS INSERTED');
                db.close();
            });
        });
	});
}

readPrograms(filePath);
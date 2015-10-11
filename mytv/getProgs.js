var feed = require("feed-read");
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var util = require('util');

function getDateFormat(){
	var today = new Date();
	console.log(today);
	return formattedDate = {
		"year" : today.getFullYear(),
		"month" : today.getMonth() < 10 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1),
		"day" : today.getDate(),
	};
}

function insertPrograms(db, collectionToInsert, programs){
	console.log('HOLA');
	db.collection(collectionToInsert).insertMany(programs, function(err, response){
		assert.equal(null,err);
		assert.equal(programs.length, response.insertedCount);
		console.log('ROWS INSERTED');
		db.close();
		console.log('CONNECTION CLOSED');
	});
}

function getTvProgs(){
	var today = getDateFormat();
	var url = 'mongodb://localhost:27017/mytvproject';
	mongoClient.connect(url, function(err, db) {
  		assert.equal(null, err);
  		console.log("Connected correctly to server.");
  		var programsToInsert = [];
  		feed("http://webnext.fr/epg_cache/programme-tv-rss_" + today["year"] +"-"+ today["month"] +"-"+ today["day"]+ ".xml", function(error, progs){
			if(error) throw error;
			var channel = "";
			var startTime = [];
			var name = "";
			var programToInsert = {};
			var splittedTitle = [];
			var todayStart = new Date();
			var tomorrow = new Date(todayStart);
			var channels = ["TF1", "France 2", "France 3", "Canal+", "France 5", "M6", "Arte", "D8", "W9", "TMC", "NT1", ];
			tomorrow.setDate(todayStart.getDate()+1);
			tomorrow.setHours(00);
			tomorrow.setMinutes(00);
			tomorrow.setSeconds(00);
			progs.forEach(function(obj){
				splittedTitle = (obj.title).split(" | ");
				console.log(splittedTitle[0].trim());
				if(channel != splittedTitle[0].trim() || name != splittedTitle[2].trim()){
					todayStart = new Date();
					//console.log(obj.content.split(/<\/{0,1}[a-z]*>/)[1]);
					channel = splittedTitle[0].trim();
					startTime = splittedTitle[1].trim().split(':');
					name = splittedTitle[2].trim();
					//console.log(channel + ' -- ' + startTime + ' -- ' + name);
					todayStart.setHours(startTime[0]);
					todayStart.setMinutes(startTime[1]);
					todayStart.setSeconds(00);
					//console.log('-->' + splittedTitle[1].trim());
					programToInsert = {
						"name" : name,
						"startDate" : todayStart,
						"endDate" : '',
						"channel" : channel,
						"genre" : obj.content.split(/<\/{0,1}[a-z]*>/)[1],
						"votes" : [],
					};
					programsToInsert.push(programToInsert);
				}
			});
			programsToInsert.forEach(function(program, index){
				if(typeof programsToInsert[index+1] != 'undefined'){
					if(programsToInsert[index+1].channel == program.channel){
						program.endDate = programsToInsert[index+1].startDate;
					} else {
						program.endDate = tomorrow;
					}
				} else {
					program.endDate = tomorrow;
				}
			});
			console.log("recup --> " + programsToInsert.length + "elements");
			//insertPrograms(db, "programs", programsToInsert);
			db.close();
		});
	});
}

getTvProgs();

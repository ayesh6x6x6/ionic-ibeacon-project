const BeaconScanner = require('node-beacon-scanner');
const express = require('express');
var _ = require('lodash');
const bodyParser = require('body-parser');
const scanner = new BeaconScanner();
const mongoose = require('mongoose');
const Telemetry = require('./models/telemetry');
const Beacon = require('./models/beacon');
const User = require('./models/user');
const app = express();
const mqtt = require('mqtt');
const broker = 'mqtt://localhost';
const Machine = require('knearest');
const KNN = require('ml-knn');
const kNN = require("k.n.n");

// var data = [ new kNN.Node({paramA: 1, paramB: 300, type: 'typeA'}), 
//              new kNN.Node({paramA: 3, paramB: 350, type: 'typeA'}), 
//              new kNN.Node({paramA: 6, paramB: 1200, type: 'typeB'}), 
//              new kNN.Node({paramA: 8, paramB: 900, type: 'typeB'}), 
//              new kNN.Node({paramA: 1, paramB: 1220, type: 'typeC'}), 
//              new kNN.Node({paramA: 2, paramB: 900, type: 'typeC'}) ];
var data = [ 
    new kNN.Node({paramA:222222222222555555555555555545,type: 'PS4-Sidetables' }),
    new kNN.Node({paramA:222222222222225555555555555555,type: 'PS4-Sidetables'}),
    new kNN.Node({paramA:222222222222555555555555522225,type: 'PS4-Sidetables'}),
    new kNN.Node({ paramA:111111111444444444444444444444,type: 'Bookshelf-Sidetables' }),
    new kNN.Node({paramA:111111114444444444444444444444,type: 'Bookshelf-Sidetables' }),
    new kNN.Node({paramA:111111114444444444444444444111,type: 'Bookshelf-Sidetables' }),
    new kNN.Node({paramA:222222222222222222222222222222,type:'PS4'}),
    new kNN.Node({paramA:222222222222222222222222222333,type:'PS4'}),
    new kNN.Node({paramA:222222224442222222222222227222,type:'PS4'}),
    new kNN.Node({paramA:444444444444444444444444444444,type:'Sidetables'}),
    new kNN.Node({paramA:344444444444444444444444444443,type:'Sidetables'}),
    new kNN.Node({paramA:444444444444444444444444444444,type:'Sidetables'}),

    new kNN.Node({paramA:333333333333333333333333333333,type:'Entrypoint-counter'}),
    new kNN.Node({paramA:333333333333333333333333333333,type:'Entrypoint-counter'}),
    new kNN.Node({paramA:333333333333333333333333333333,type:'Entrypoint-counter'}),
    new kNN.Node({paramA:333333333333333333333333313333,type:'Entrypoint-counter'}),

    new kNN.Node({paramA:666666666666111111111111111111,type:'Business-bookshelf'}),
    new kNN.Node({paramA:666666666666666111111111111111,type:'Business-bookshelf'}),
    new kNN.Node({paramA:666666666666666111111111111111,type:'Business-bookshelf'}),

    new kNN.Node({paramA:555555555555555555555533355555,type:'Sidetables'}),
    new kNN.Node({paramA:555555555555555555555333335125,type:'Sidetables'}),
    new kNN.Node({paramA:555555555555555555555555555553,type:'Sidetables'}),

    new kNN.Node({paramA: 111111111111111111114111411111,type:'Bookshelf'}),
    new kNN.Node({paramA:111111111111111111111111111111,type:'Bookshelf'}),
    new kNN.Node({paramA:111111111111111111111111111111,type:'Bookshelf'}),
    new kNN.Node({paramA:111111111111111111111111111111,type:'Bookshelf'}),
       
    new kNN.Node({paramA:777777777777777777777777777777,type:'Corner'}),
    new kNN.Node({paramA:777777777777777777777777777777,type:'Corner'}),
    new kNN.Node({paramA:777777777777777777777777777777,type:'Corner'}),

    new kNN.Node({paramA:666666666666666666666666666666,type:'Business'}),
    new kNN.Node({paramA:666666666666666666666666666666,type:'Business'}),
    new kNN.Node({paramA:666666666666666666666666666666,type:'Business'})];
var example = new kNN(data);

var Color = require('color');
var color = Color('#7743CE');
var info = "this is life";
info.fontcolor = color;
console.log(info);

var mongodbHost = 'ds259912.mlab.com';
var mongodbPort = '59912';
var authenticate = 'shilpa:est123@'; 
var mongodbDatabase = '490_beacon';

var clusters = {
    "0":"PS4-Sidetables",
    "1":"Bookshelf-Sidetables",
    "2":"PS4",
    "3":"Sidetables",
    "4":"Entrypoint-counter",
    "5":"Business-bookshelf",
    "6":"Sidetables",
    "7":"Bookshelf",
    "8":"Corner",
    "9":"Business"
}

var idTable = {
     '38872':"39f774e86fece799",
     '45700':"88e490df11769a5b",
     '16549':"b19334231ae24c5e"    
 }

zoneInfo = {
    "38872": "1", //book shelf
    "45700": "2", //ps4
    "16549": "3", //pink entrance beacon
    "58350": "4", //side table beacon
    "1859" : "5", //side table beacon
    "35730": "6", //business beacon
    "3588" : "7"  //shop corner beetroot
}
var tableBeacons = {
    '35730':'Business Sofas',
    '1859': 'Side Sofas',
    '58350': 'Side Sofas'
};
var startup = true;
var sidetablebeacons = ['1859','58350'];
var businessbeacons = ['35730'];
var userTracker = [];
var shopTemp = 0;
var shopLight = 0;

var mqtt_client = mqtt.connect(broker);

var mqtt_client2 = mqtt.connect('mqtt://broker.hivemq.com');
mqtt_client2.subscribe('/cafe/temperature/38872');
mqtt_client2.subscribe('/cafe/temperature/45700');
mqtt_client2.subscribe('cafe/logout/#');

mqtt_client2.on('message',(topic,payload)=>{
    var loggedoutuser = payload;
    userTracker = _.remove(userTracker,{user:loggedoutuser});
});

setInterval(()=>{
    if(userTracker.length > 0){
        userTracker = _.uniq(userTracker);
    }
    mqtt_client2.publish('cafe/status',JSON.stringify({tables:userTracker,temperature:shopTemp,crowd_count:userTracker.length ,ambientLight:shopLight}));
    console.log('Published status information');
    console.log(userTracker);
    console.log(shopLight);
    console.log(shopTemp);
},10000);
    
mqtt_client2.on('connect', function () {
        scanner.onadvertisement = (ad) => {
            if(ad.beaconType == "estimoteTelemetry" && ad.estimoteTelemetry.subFrameType == 1)
              {
                var minor = _.findKey(idTable, _.partial(_.isEqual, ad.estimoteTelemetry.shortIdentifier));
                if(minor == "45700"){
                    var temp = ad.estimoteTelemetry.temperature;
                    var light = ad.estimoteTelemetry.light;
                    shopTemp = temp;
                    shopLight = light;
                    console.log(ad.estimoteTelemetry.shortIdentifier);
                }
                
              }
             }
            // Start scanning
            setInterval(()=>{            
                    scanner.startScan().then(() => {
                        console.log('Started to scan.');
                        setTimeout(()=>{
                            scanner.stopScan();
                        },15000);
                      }).catch((error) => {console.error(error);});
               
            },30000);           
          }
        );
var len = false;

var url = 'mongodb://'+authenticate+mongodbHost+':'+mongodbPort + '/' + mongodbDatabase;
mongoose.connect(url).then( () => {
    //behavior track code
    setInterval(()=>{
        userTracker.forEach(track=>{
            if(track.track_count < 30){
                var toAdd = zoneInfo[track.table];
                if(toAdd){
                    track.track_count ++;
                    track.behavior += toAdd;
                    console.log('To ADD:'+toAdd);
                }                
            } else if(track.visit_done == 0 && track.track_count >= 30) {
                track.visit_done = 1;
                User.findOneAndUpdate({username:track.user},{$push: {visit:track.behavior}},(err,r)=>{
                    if(err){
                        console.log(err);
                    }
                    console.log(r);
                });
            }
        });
    },30000);
    mqtt_client.on('message', (topic, payload) => {
        console.log(`message from ${topic}: ${payload}`);
        if(topic.substring(0,12)=='cafe/logout/'){
            var name = payload;
            var ind = userTracker.findIndex(track => track.user == name);
            userTracker.splice(ind,1);
        }
        if(topic.substring(0,17)=='cafe/usertracker/'){
                var userData = JSON.parse(payload);
                var user = userData.user;
                var table = userData.table;
    
                if((userTracker.findIndex(track=>track.user == user))>=0){
                    console.log('Already there lol;)'); // remove old location and push new location!!
                    var ind = userTracker.findIndex(track=>track.user==user);
                    console.log('Found user at index:'+ind);
                    userTracker[ind].table = table;
                    console.log('New updated location:'+userTracker[ind]);
                } else {
                    userTracker.push({user:user,table:table,track_count:0,behavior:'',visit_done:0});
                }
                console.log(userTracker);

                  
        }
        if(topic.substring(0,11) == 'cafe/entry/'){
            User.findOne({username:payload},(err,res)=>{
                if(err){
                    console.log(err);
                } else {
                    if(res.visit.length>0){
                        console.log(res.visit[res.visit.length - 1]);
                        var ress = example.launch(1, new kNN.Node({paramA:Number(res.visit[res.visit.length-1]),type:false}));

                        console.log(ress.type + ": "+ress.percentage+"%");

                        mqtt_client.publish(`cafe/specials/${res.username}`,ress.type);
 
                        // Machine.on('guess', ({ elapsed: Number, feature: String, value: String }) => console.log('Guessed'+value) );
                    }
                    console.log('New user:'+res);
                    // console.log('New users color:'+res["color"]);
                    var zones = _.uniq(res.preferredZone);
                    console.log('Zones is now:'+zones);
                    var zone = zones[0];
                    var tosend = "";
                    if(zone == "Side Sofas"){
                        if(userTracker.length > 0){
                            console.log(userTracker);
                            var first_or_second = false;
                            sidetablebeacons.forEach((beacon)=>{
                                console.log('Beacon:'+beacon);
                                if(!_.find(userTracker,{table:beacon})){
                                    console.log('FINSALLYY');
                                    tosend = beacon;
                                    console.log('Found table:'+tosend);
                                    first_or_second = true;
                                }
                            });
                            if(!first_or_second){
                                if(zones.length > 1) {
                                    zone = zones[1];
                                    if(zone == "Business Sofas"){
                                        businessbeacons.forEach((beacon)=>{
                                            console.log('Beacon:'+beacon);
                                            if(!_.find(userTracker,{table:beacon})){
                                                console.log('FINSALLYY');
                                                tosend = beacon;
                                                first_or_second = true;
                                                console.log('Found table:'+tosend);
                                            }
                                        });
                                    }
                                }
                            }
                            if(!first_or_second){
                                tosend = "AllBusy";
                            }
                        } else {
                            tosend = sidetablebeacons[0];
                        }
                        

                    } else if (zone == "Business Sofas"){
                        if(userTracker.length > 0){
                            console.log(userTracker);
                            var first_or_second = false;
                            businessbeacons.forEach((beacon)=>{
                                console.log('Beacon:'+beacon);
                                if(!_.find(userTracker,{table:beacon})){
                                    console.log('FINSALLYY');
                                    tosend = beacon;
                                    console.log('Found table:'+tosend);
                                    first_or_second = true;
                                }
                            });
                            if(!first_or_second){
                                if(zones.length > 1) {
                                    zone = zones[1];
                                    if(zone == "Side Sofas"){
                                        sidetablebeacons.forEach((beacon)=>{
                                            console.log('Beacon:'+beacon);
                                            if(!_.find(userTracker,{table:beacon})){
                                                console.log('FINSALLYY');
                                                tosend = beacon;
                                                first_or_second = true;
                                                console.log('Found table:'+tosend);
                                            }
                                        });
                                    }
                                }
                            }
                            if(!first_or_second){
                                tosend = "AllBusy";
                            }
                        } else {
                            tosend = businessbeacons[0];
                        }
                    }
                    // console.log('Booked beacons:'+bookedTables);
                    // var colors = JSON.parse(res.color);
                    console.log('Users red color'+res.r);
                    var r = res.r;
                    var g = res.g;
                    var b = res.b;
                    mqtt_client.publish(`cafe/booktable/${payload}`,JSON.stringify({zone:tosend,r:r,g:g,b:b}));
                    console.log('Booked and payload is'+payload);
                    // mqtt_client.unsubscribe('cafe/entry/#');
                }
            });
        }
        if(topic.substring(0,14) == 'cafe/favtable/'){
            var result = JSON.parse(payload);
            var username = result.username;
            var tableBeacon = result.table;
            var zone = tableBeacons[tableBeacon];
            
            console.log('Zone is:'+zone);
            User.findOne({username:username},(err,res)=>{
                var u = res.username;
                console.log('u is:'+u);
                if(err){
                    console.log(err);
                } else {
                    User.findOneAndUpdate({username:username},{$addToSet:{ preferredZone:{$each: [zone]}}},(err,res)=>{
                        if(err){
                            console.log(err);
                        } else {
                            console.log(res);
                        }
                    });
                }
            });
        }
    }); 

    mqtt_client.subscribe('cafe/favtable/#');
    mqtt_client.subscribe('cafe/entry/#');
    mqtt_client.subscribe('cafe/booktable');
    mqtt_client.subscribe('cafe/usertracker/#');
    // mqtt_client.publish('cafe/users/',0);
    // mqtt_client.publish('cafe/users/#',0);
    // mqtt_client.publish('cafe/users/Ayesh',0);
    mqtt_client.subscribe('cafe/logout/#');
});
    

app.use(bodyParser.urlencoded({ extended: false }));
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-ALlow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
  });

module.exports = app;
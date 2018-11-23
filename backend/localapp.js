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
const axios = require('axios');

var mongodbHost = 'ds259912.mlab.com';
var mongodbPort = '59912';
var authenticate = 'shilpa:est123@'; 
var mongodbDatabase = '490_beacon';

// var bookedTables = [];
var idTable = {
     '38872':"39f774e86fece799",
     '45700':"88e490df11769a5b",
     '16549':"b19334231ae24c5e"    
 }
var tableBeacons = {
    '35730':'Business Sofas',
    '1859': 'Side Sofas',
    '58350': 'Side Sofas'
};
var sidetablebeacons = ['1859','58350'];
var businessbeacons = ['35730'];
var userTracker = [];
var shopTemp = 0;
var shopLight = 0;

var mqtt_client = mqtt.connect(broker);
var mqtt_client2 = mqtt.connect('mqtt://broker.hivemq.com');
mqtt_client2.subscribe('/cafe/temperature/38872');
mqtt_client2.subscribe('/cafe/temperature/45700');

setInterval(()=>{
    if(userTracker.length > 0){
        userTracker = _.uniq(userTracker);
    }
    mqtt_client2.publish('cafe/status',JSON.stringify({tables:userTracker,temperature:shopTemp,ambientLight:shopLight}));
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
    mqtt_client.on('message', (topic, payload) => {
        console.log(`message from ${topic}: ${payload}`);
        if(topic.substring(0,12)=='cafe/logout/'){
            var name = payload;
            var ind = userTracker.findIndex(track => track.user == name);
            userTracker.splice(ind,1);
        }
        if(topic.substring(0,11)=='cafe/users/'){
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
                userTracker.push({user:user,table:table});
            }
            console.log(userTracker);                  
        }
        if(topic.substring(0,11) == 'cafe/entry/'){
            User.findOne({username:payload},(err,res)=>{
                if(err){
                    console.log(err);
                } else {
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
                                                console.log('Found table:'+tosend);
                                            }
                                        });
                                    }
                                }
                            }
                        } else {
                            tosend = sidetablebeacons[0];
                        }
                        

                    } else if (zone == "Business Sofas"){
                        // businessbeacons.forEach((beacon)=>{
                        //     if(!bookedTables.indexOf(beacon)>=0){
                        //         tosend = beacon;
                        //     }
                        // });
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
    mqtt_client.subscribe('cafe/users/#');
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
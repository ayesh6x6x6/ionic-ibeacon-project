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

var mongodbHost = 'ds259912.mlab.com';
var mongodbPort = '59912';
var authenticate = 'shilpa:est123@'; 
var mongodbDatabase = '490_beacon';

var cart = [];
var idTable = {
     '38872':"39f774e86fece799",
     '45700':"88e490df11769a5b",
     '16549':"b19334231ae24c5e"    
 }
var uuidTable = [
     'D0D3FA86-CA76-45EC-9BD9-6AF487801DC6',
     'D0D3FA86-CA76-45EC-9BD9-6AF4FE1A9236'
]
var tableBeacons = {
    '35730':'Business Sofas',
    '1859': 'Business Zone',
    '58350': 'Side Sofas'
};
var mqtt_client = mqtt.connect(broker);
mqtt_client.subscribe('/cafe/temperature/38872');
mqtt_client.subscribe('/cafe/temperature/45700');
    
    mqtt_client.on('connect', function () {
        scanner.onadvertisement = (ad) => {
            if(ad.beaconType == "estimoteTelemetry")
              {
                //   console.log(ad);
                var temp = ad.estimoteTelemetry.temperature;
                console.log(ad.estimoteTelemetry.shortIdentifier);
                var minor = _.findKey(idTable, _.partial(_.isEqual, ad.estimoteTelemetry.shortIdentifier));
                // var minor = _.findKey(idTable,function(o){return idTable[o] == ad.estimoteTelemetry.shortIdentifier});
                console.log('Minor:'+minor);
                if(temp != undefined)
                {
                 mqtt_client.publish("/cafe/temperature/"+minor,String(temp),{retain:true});
                 console.log('Published Temperature');
                //   console.log("ID: ",ad.id," Temperature: ",temp);
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
        setInterval(()=>{
            mqtt_client.publish('/ayesh/senior', 'Hello mqtt');
            // mqtt_client.subscribe('/cafe/temperature/38872');
            // mqtt_client.subscribe('/cafe/temperature/45700');
            console.log('Published');
        },3000);
            
          }
        );
        var len = false;
var url = 'mongodb://'+authenticate+mongodbHost+':'+mongodbPort + '/' + mongodbDatabase;
mongoose.connect(url).then( () => {
    mqtt_client.on('message', (topic, payload) => {
        console.log(`message from ${topic}: ${payload}`);
        if(topic.substring(0,11) == 'cafe/entry/'){
            User.findOne({username:payload},(err,res)=>{
                if(err){
                    console.log(err);
                } else {
                    var zones = _.uniq(res.preferredZone);
                    console.log('Zones is now:'+zones);
                    var zone = zones[0];
                    mqtt_client.publish('cafe/booktable',zone,{retain:true});
                    console.log('Booked and payload is'+payload);
                    mqtt_client.publish('cafe/booked/'+payload,JSON.stringify({username:payload,zone:zone}),{retain:true});
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
                    if(res.preferredZone.length > 10) {
                        len = true; 
                    }
                }
            });
            console.log('len is '+len);
            if(len==false){
                User.findOneAndUpdate({username:username},{$push:{preferredZone:zone}},(err,res)=>{
                    if(err){
                        console.log(err);
                    } else {
                        console.log(res);
                    }
                });
            }

        }
    }); 
    mqtt_client.subscribe('cafe/favtable/#');
    mqtt_client.subscribe('cafe/entry/#');
});
    

app.use(bodyParser.urlencoded({ extended: false }));
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-ALlow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
  });

module.exports = app;
const BeaconScanner = require('node-beacon-scanner');
const express = require('express');
var _ = require('lodash');
const bodyParser = require('body-parser');
const scanner = new BeaconScanner();
const mongoose = require('mongoose');
const Telemetry = require('./models/telemetry');
const Beacon = require('./models/beacon');
const MenuItem = require('./models/menuitem');
const User = require('./models/user');
const Order = require('./models/order');
const app = express();
const mqtt = require('mqtt');
const broker = 'mqtt://test.mosquitto.org';

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
                 mqtt_client.publish("/cafe/temperature/"+minor,String(temp));
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
    mqtt_client.on('message', (topic, payload) => {
        console.log(`message from ${topic}: ${payload}`)
    });  



// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-ALlow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
  });

//   var user = {};
// app.post('/api/tobarista',(req,res)=>{
//     console.log(req.body);
//     console.log(req.body.email);
//     const email = req.body.email;
//     User.findOne({email:email},(err,userr)=>{
//         if(err){
//             console.log(err);
//         } else {
//             user = userr;
//             console.log('User is now:'+user);
//         }
//     });
// });

app.get('/api/:uuid/:minor', (req,res)=>{
    // console.log('Received a request');
    const id = req.params.uuid;
        Beacon.findOne({"uuid":req.params.uuid,"minor":req.params.minor},(err,result)=>{
            if(err){
                console.log(err);
            } else {
                // console.log(result);
                // console.log(result.id);
                // console.log(idTable[result.minor]);
                Telemetry.findOne({"shortId":idTable[result.minor]},(err,result2)=>{
                    if(err) {
                        res.status(404).send(err);
                    } else {
                        res.status(200).json(result2.temperature);
                    }
                    
                });
                
            }
        });
});





module.exports = app;
const BeaconScanner = require('node-beacon-scanner');
const express = require('express');
const bodyParser = require('body-parser');
const scanner = new BeaconScanner();
const mongoose = require('mongoose');
const Telemetry = require('./models/telemetry');
const Beacon = require('./models/beacon');
const MenuItem = require('./models/menuitem');
const User = require('./models/user');
const Order = require('./models/order');
const app = express();
 
 var mongodbHost = 'ds259912.mlab.com';
 var mongodbPort = '59912';
 var authenticate = 'shilpa:est123@'; 
 var mongodbDatabase = '490_beacon';
 var cart = [];
 var idTable = {
     38872:"39f774e86fece799",
     45700:"88e490df11769a5b",
     16549:"b19334231ae24c5e"    
 }
 var uuidTable = [
     'D0D3FA86-CA76-45EC-9BD9-6AF487801DC6',
     'D0D3FA86-CA76-45EC-9BD9-6AF4FE1A9236'
 ]
 
var url = 'mongodb://'+authenticate+mongodbHost+':'+mongodbPort + '/' + mongodbDatabase;
mongoose.connect(url).then( () => {
    console.log("Connected correctly to server.");
    // const capp = new MenuItem({
    //     _id:new mongoose.Types.ObjectId(),
    //     img: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Cappuccino_at_Sightglass_Coffee.jpg",
    //     name: "Cappucino",
    //     price: 15.5,
    //     description: "a type of coffee made with espresso and milk that has been frothed up with pressurized steam."
    // });
    // const mocha = new MenuItem({
    //     _id: new mongoose.Types.ObjectId(),
    //     img: "http://theclassicvapeco.com/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/c/a/cafe-mocha-e-liquid.jpg",
    //     name: "Mocha",
    //     price: 14,
    //     description: "also called mocaccino (Italian: [mokatˈtʃiːno]), is a chocolate-flavored variant of a caffè latte."
    // });
    // const latte = new MenuItem({
    //     _id: new mongoose.Types.ObjectId(),
    //     img: "https://www.nespresso.com/ncp/res/uploads/recipes/Caff%C3%A8%20Latte%20by%20Nespresso.jpg",
    //     name: "Latte",
    //     price: 10,
    //     description: "A latte (/ˈlɑːteɪ/ or /ˈlæteɪ/)[1][2] is a coffee drink made with espresso and steamed milk."
    // });
    // capp.save().then(()=>{
    //     console.log('Saved Cappucino');
    // });
    // mocha.save().then(()=>{
    //     console.log('Saved Mocha!');
    // });
    // latte.save().then(()=>{
    //     console.log('Saved Latte!');
    // });
    // const beacon1 = new Beacon({
    //     "id": "ea00e4a9267f",
    //     "uuid": "B9407F30-F5F8-466E-AFF9-25556B579999",
    //     "major": 12870,
    //     "minor": 16549,
    // });
    // const beacon2 = new Beacon({
    //     "id": "d257bce4414f",
    //     "uuid": "B9407F30-F5F8-466E-AFF9-25556B579999",
    //     "major": 12870,
    //     "minor": 45700,
    // });
    // const beacon3 = new Beacon({
    //     "id": "e806f56eb5fe",
    //     "uuid": "B9407F30-F5F8-466E-AFF9-25556B579999",
    //     "major": 12870,
    //     "minor": 38872
    // });
    // beacon1.save().then(()=>{
    //     console.log('Saved a beacon1');
    // });
    // beacon2.save().then(()=>{
    //     console.log('Saved a beacon2');
    // });
    // beacon3.save().then(()=>{
    //     console.log('Saved a beacon3');
    // });
    scanner.onadvertisement = (ad) => {
        if(ad.beaconType == "estimoteTelemetry")
          {
            //   console.log(ad);
            var temp = ad.estimoteTelemetry.temperature;
            if(temp != undefined)
            {
              const temporary=new Telemetry({
              //_id: new mongoose.Types.ObjectId(),
              id: ad.id,
              shortId: ad.estimoteTelemetry.shortIdentifier,
              temperature: temp
             });
              temporary.save().then(()=>{
                //   console.log('Saved a telemetry!');
              });
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
    
}  
);

// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-ALlow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
  });

var AuthController = require('./auth/AuthController');
app.use('/api/auth', AuthController);

var user = {};

app.get('/api/getuser',(req,res)=>{
    res.status(200).json(user);
});

app.post('/api/tobarista',(req,res)=>{
    console.log(req.body);
    console.log(req.body.email);
    const email = req.body.email;
    User.findOne({email:email},(err,userr)=>{
        if(err){
            console.log(err);
        } else {
            user = userr;
            console.log('User is now:'+user);
        }
    });
});

app.get('/api/getitems',(req,res)=>{
    console.log('Getting items now!');
    MenuItem.find((err,result)=>{
        if(err){
            console.log('Couldnt find any items!');
        } else {
            console.log(result);
            res.status(200).json({items:result});
        }
    });
});

app.post('/api/checkout',(req,res)=>{
    console.log(req.body);
    console.log(req.body.user);
    var userr = JSON.parse(req.body.user);
    console.log(userr.username);
    const cart = JSON.parse(req.body.cart);
    console.log(cart);
    let ord;
    User.findOne({email:userr.email},(err,user)=>{
        console.log(user);
        const order = new Order({
            customer:user,
            bill:req.body.total,
            items:cart
        });
        ord = order;
        order.save();
        console.log(order);
        
        // user.save(()=>{
        //     console.log('Saved');
        // });
        console.log(user);
        // User.findOneAndUpdate({email:user.email},{$push: {orderHistory:order}});
        //     if(err){
        //         console.log(err);
        //     }
        //     console.log(u);
        // });
        // res.send('Successfully updated');
        userr = user;
    }).then(resolve=>{
        User.findByIdAndUpdate({_id:userr._id},{$push: {orderHistory:ord}},(err,r)=>{
            console.log(r);
        });
    });
    

    
});

app.post('/api/addtocart',(req,res)=>{
    const item = req.body.item;
    console.log('Req body'+JSON.stringify(req.body));
    console.log('Item received:' + JSON.stringify(item));
    cart.push(item);
    console.log('Added Item');
    res.status(200).send('Added item!');
});

app.post('/api/removefromcart',(req,res)=>{
    const item = req.body.item;
    const index = cart.indexOf(item);
    cart.splice(index,1);
    res.status(200).send('Removed item!');
});

app.get('/api/getcartitems',(req,res)=>{
    res.status(200).json({cart:cart});
});

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
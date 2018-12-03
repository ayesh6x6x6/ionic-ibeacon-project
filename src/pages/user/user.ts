import { Component, OnInit, NgZone } from '@angular/core';
import { NavController, NavParams, Events, AlertController, Col } from 'ionic-angular';
import { BeaconProvider } from '../../services/beacon-provider';
import { IBeaconDelegate, IBeacon } from '@ionic-native/ibeacon';
import { WhitePage } from '../white/white';
import { YellowPage } from '../yellow/yellow';
import { PinkPage } from '../pink/pink';
import { HTTP } from '@ionic-native/http';
import { MenuPage } from '../menu/menu';
import { connect, Client, IConnackPacket,IClientPublishOptions } from 'mqtt';
import { ShopStatusPage } from '../shop-status/shop-status';
import Color from 'color';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { rgb } from 'color-convert/conversions';

@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})
export class UserPage implements OnInit {
  username: string='';
  email:string='';
  picture:string='';
  color = Color('rgb(117,0,199)');
  subTitle: string = 'Do you want to repeat any of your favorite orders?';
  delegate:IBeaconDelegate;
  beaconFound = false;
  beaconTemp:Number = 0;
  whitePage = WhitePage;
  isShelf: boolean = false;
  isPS4: boolean = false;
  yellowPage = YellowPage;
  zone:any ;
  location: string = '';
  state:string = '';
  uuidTable = [
    '35730',
    '1859',
    '58350'
  ];
  baristaBeacons = ['58342'];
  alertCount = 0;
  client:Client;
  client2:Client;
  reached:boolean = false;
  mqtt_connected = false;
  

  constructor(public navCtrl: NavController, public navParams: NavParams, public beaconProvider:BeaconProvider,
              public events: Events,private http: HTTP,private ibeacon: IBeacon,public localNotifications: LocalNotifications,
              private alertCtrl: AlertController) {
      this.zone = new NgZone({ enableLongStackTrace: false });
      this.subTitle = this.subTitle.fontcolor(this.color.hex());
      this.subTitle
      this.client = connect('mqtt://192.168.1.128',{port:3000});
      this.client2 = connect('mqtt://broker.hivemq.com/mqtt',{port:8000});
      this.client.on('connect', ()=>{
        console.log('Phone connected to mqtt broker');
        this.mqtt_connected = true;
      });
      

      this.client.on('message', (topic: string, payload: string) => {
        if(topic.substring(0,13)=='cafe/specials'){
          console.log('Got specials');
          const alert = this.alertCtrl.create({
            title:"You are identified",
            subTitle:payload,
            buttons:[              
              {
                text:'Ok'
              }
            ]
          });
          alert.present();
          // this.localNotifications.schedule({
          //   id: 1,
          //   title:'SmartCafe',
          //   text: payload,
          //   trigger: {at: new Date(new Date().getTime())}
          // });
        }
        if(topic.substring(0,18)=='/cafe/temperature/'){
          this.beaconTemp = Number(payload);
        }
        if(topic.substring(0,15)=='cafe/booktable/'){
          console.log('Got booktable');
          const info = JSON.parse(payload);
          if(info.zone == "AllBusy"){
            const alert = this.alertCtrl.create({
              title:"All our tables in your preferred spots are busy right now!",
              subTitle:"Please wait in the waiting zone or try a spot you haven't been to before!",
              buttons:[              
                {
                  text:'Ok'
                }
              ]
            });
            alert.present();
          }
          else if(info.zone) {
            var r = info.r;
            var g = info.g;
            var b = info.b;
            if(r == 255) {
              r = 0;
            }
            if(g == 255){
              g = 0;
            }
            if(b == 255){
              b = 0;
            }
            var mess = "Look out for this color lamp!";
            this.color = Color(`rgb(${r},${g},${b})`);
            mess = mess.fontcolor(this.color.hex());
            const alert = this.alertCtrl.create({
              title:"Table " + info.zone + " has been assigned to you!",
              subTitle:mess,
              buttons:[              
                {
                  text:'Ok'
                }
              ]
            });
            alert.present();
          }          
        }
        console.log(`message from ${topic}: ${payload}`);
    }).on('connect', (packet: IConnackPacket) => {
        console.log('connected!', JSON.stringify(packet))
    });
  }

  onOrder(){
    this.navCtrl.push(MenuPage);
  }

  ngOnInit() {
    this.username = this.navParams.get('username');
    this.email = this.navParams.get('email');
    this.state = this.navParams.get('state');
    this.picture = this.navParams.get('picture');
  }

  ionViewDidLoad() {    
    this.client.subscribe(`cafe/booktable/${this.username}`);
    this.client.subscribe(`cafe/specials/${this.username}`);
    this.beaconProvider.scanBeacons();
    console.log('State in load:'+this.state);
    if(this.state == 'CLRegionStateInside'){
      this.client.publish('cafe/entry/'+this.username,this.username);
      let alert = this.alertCtrl.create({
        title: 'Welcome back ' + this.username,
        subTitle: this.subTitle,
        inputs:[
          {
            type: 'radio',
            label: 'Cappucino',
            value: 'Cappucino'
          },
          {
            type:'radio',
            label: 'Latte',
            value:'Latte'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
          },
          {
            text: 'Order Now',
            handler: () => {
              console.log('Buy clicked');
            }
          }
        ]
      });
      alert.present();
    }
  }

  ionViewDidEnter(){
    console.log('State in Enter:'+this.state);
  }

  ionViewWillEnter() {
    this.events.subscribe('didEnterRegion', (data) => {
      this.zone.run(()=> {
        console.log('in Home.ts'+ data);
        console.log('Entered Region');
        this.client.publish('cafe/entry/'+this.username,this.username);
      }); 
    });
    this.events.subscribe('didExitRegion',(data)=>{
      this.zone.run(()=>{
        this.client2.publish(`cafe/logout/${this.username}`,this.username);
      });
    });
    this.events.subscribe('didRangeBeaconsInRegion', (data) => {
      console.log('Inside Subscription');     
      this.zone.run(() => {
      console.log('INSIDE RUN');    
      this.isShelf = false;
      this.isPS4 = false;
      console.log("Beacon collected: " + JSON.stringify(data.beacon));          
      const uuid = data.beacon.uuid.toUpperCase();
      if(this.uuidTable.indexOf(data.beacon.minor) >= 0){  
                
        console.log('Finishing with: '+'Finish '+data.beacon.minor);
        this.client.publish('cafe/usertracker/'+this.username,JSON.stringify({user:this.username,table:data.beacon.minor}));
        this.client.publish('cafe/booktable',JSON.stringify({zone:"Finish "+data.beacon.minor,r:0,g:0,b:0}));
        this.client.publish('cafe/favtable/'+this.username,JSON.stringify({username:this.username,table:data.beacon.minor}));  
        if(this.alertCount <=0 ){
          this.alertCount = 1;
          const confirmOrder = this.alertCtrl.create({
            title:'Place an Order?',
            message: "Now that you're comfortable, You can begin browsing our menu, if you would like?",
            buttons: [
              {
               text: 'Not now',
               role: 'cancel'
              },
              {
               text: 'Yes, Continue',
               handler: () => {
               this.navCtrl.push(MenuPage);
               }
              }
            ]
              });
              confirmOrder.present();
            }

           } else if(this.baristaBeacons.indexOf(data.beacon.minor) >=0 ){
             this.client.publish('cafe/usertracker/'+this.username, JSON.stringify({user:this.username,table:data.beacon.minor}));
             this.client.publish(`cafe/tobarista`,JSON.stringify({username:this.username,email:this.email}));
             console.log('Published a user from phone!');          
           } else {
           this.client.publish('cafe/usertracker/'+this.username, JSON.stringify({user:this.username,table:data.beacon.minor}));
           this.client.subscribe('/cafe/temperature/'+data.beacon.minor);
           switch(data.beacon.minor) {
             case '38872': 
             this.isShelf = true;
             break;
             case '16549': 
             break;
             case '45700':  
             this.isPS4 = true;
             break;
             default: this.location = 'Nowhere Found!';
           }    
          }      
         console.log('Location now is : ' + this.location);
         console.log('Just before craeeting alert');   
      
     }); 
  });
  }

  onViewConditions(){
    this.navCtrl.push(ShopStatusPage);
  }

  onShelf() {
    this.navCtrl.push(this.whitePage, {beacon:this.beaconTemp});
  }

  onPS4() {
    this.navCtrl.push(this.yellowPage, {beacon:this.beaconTemp});
  }

}

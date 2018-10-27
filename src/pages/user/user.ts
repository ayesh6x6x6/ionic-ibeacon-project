import { Component, OnInit, NgZone } from '@angular/core';
import { NavController, NavParams, Events, AlertController } from 'ionic-angular';
import { BeaconProvider } from '../../services/beacon-provider';
import { IBeaconDelegate, IBeacon } from '@ionic-native/ibeacon';
import { WhitePage } from '../white/white';
import { YellowPage } from '../yellow/yellow';
import { PinkPage } from '../pink/pink';
import { HTTP } from '@ionic-native/http';
import { MenuPage } from '../menu/menu';

@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})
export class UserPage implements OnInit {
  username: string='';
  email:string='';
  delegate:IBeaconDelegate;
  beaconFound = false;
  beaconTemp:Number;
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public beaconProvider:BeaconProvider,
    public events: Events,private http: HTTP,
    private ibeacon: IBeacon,private alertCtrl: AlertController) {
      this.zone = new NgZone({ enableLongStackTrace: false });
  }

  onOrder(){
    this.navCtrl.push(MenuPage);
  }

  ngOnInit() {
    this.username = this.navParams.get('username');
    this.email = this.navParams.get('email');
    this.state = this.navParams.get('state');
  }

  ionViewDidLoad() {    
    this.beaconProvider.scanBeacons();
    console.log('State in load:'+this.state);
    if(this.state == 'CLRegionStateInside'){
      let alert = this.alertCtrl.create({
        title: 'Welcome back ' + this.username,
        subTitle: 'Do you want to repeat any of your favorite orders?',
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
    // this.beaconProvider.findState();

    this.events.subscribe('didRangeBeaconsInRegion', (data) => {
      // this.ibeacon.stopRangingBeaconsInRegion(data.beacon.region);
      console.log('Inside Subscription');     
      this.zone.run(() => {
        console.log('INSIDE RUN');    
        this.isShelf = false;
        this.isPS4 = false;
        console.log("Beacon collected: " + JSON.stringify(data.beacon));          
      //  this.beacons.forEach((beacon)=> {
        //  if(beacon.proximity == 'ProximityImmediate') {
          const uuid = data.beacon.uuid.toUpperCase();
          if(this.uuidTable.indexOf(data.beacon.minor) >= 0 && this.alertCount <= 0){        
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
           } else if(this.baristaBeacons.indexOf(data.beacon.minor) >=0 ){
             this.http.post('http://10.25.159.146:3000/api/tobarista',{username:this.username,email:this.email},{}).then(result=>{
               console.log(result);
             });
           } else {
            this.http.get('http://10.25.159.146:3000/api/'+uuid+'/'+data.beacon.minor,{},{}).then(data=>{
              console.log('Received Http Data: ' + data.data);
                this.beaconTemp = data.data;
                console.log('This is this.beacon:'+this.beaconTemp);             
          });
           switch(data.beacon.minor) {
             case '38872': 
            //  this.location = 'This is the Quiet Zone!';
            // this.ibeacon.stopRangingBeaconsInRegion(data.beacon.region);
            this.isShelf = true;
             break;
             case '16549': 
            //  this.location = 'You are near the counter from where you can order!';
            // this.ibeacon.stopRangingBeaconsInRegion(data.beacon.region);
            //  this.navCtrl.push(PinkPage);
             break;
             case '45700': 
            //  this.location = 'This is one of our PS4 tables, you can connect and play! for 10 AED/hr!';
            // this.ibeacon.stopRangingBeaconsInRegion(data.beacon.region); 
             this.isPS4 = true;
             break;
             default: this.location = 'Nowhere Found!';
           }    
          }      
        //  }
         console.log('Location now is : ' + this.location);
         console.log('Just before craeeting alert');   
      
     }); 
  });
  }

  onShelf() {
    this.navCtrl.push(this.whitePage, {beacon:this.beaconTemp});
  }

  onPS4() {
    this.navCtrl.push(this.yellowPage, {beacon:this.beaconTemp});
  }

}

import { Component, NgZone, OnDestroy } from '@angular/core';
import { NavController,Platform, Events } from 'ionic-angular';
import { IBeacon, IBeaconDelegate } from '@ionic-native/ibeacon';
import { HTTP } from '@ionic-native/http';
import { BeaconProvider } from '../../services/beacon-provider';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AlertController } from 'ionic-angular';
import { WhitePage } from '../white/white';
import { PinkPage } from '../pink/pink';
import { YellowPage } from '../yellow/yellow';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage implements OnDestroy {
  delegate:IBeaconDelegate;
  beaconFound = false;
  beaconTemp:Number;
  whitePage = WhitePage;
  isShelf: boolean = false;
  isPS4: boolean = false;
  yellowPage = YellowPage;
  zone:any ;
  location: string = '';

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public platform: Platform,  
      public localNotifications: LocalNotifications, private http: HTTP,
     private ibeacon: IBeacon,public beaconProvider: BeaconProvider, public events: Events) {
      this.zone = new NgZone({ enableLongStackTrace: false });
  }

  ngOnDestroy() {
    this.events.unsubscribe('didEnterRegion');
    this.events.unsubscribe('didExitRegion');
    this.events.unsubscribe('didRangeBeaconsInRegion');
  }

  onShelf() {
    this.navCtrl.push(this.whitePage, {beacon:this.beaconTemp});
  }

  onPS4() {
    this.navCtrl.push(this.yellowPage, {beacon:this.beaconTemp});
  }

  ionViewWillLeave() {
    this.events.unsubscribe('didEnterRegion');
    this.events.unsubscribe('didExitRegion');
    this.events.unsubscribe('didRangeBeaconsInRegion');
  }

  ionViewWillEnter() {
    this.listenToBeaconEvents();
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
    console.log('PLATFORM READY');
    this.beaconProvider.initialise().then((isInitialised) => {
      console.log('NEVER INITIALIZEDDDDDD');
    if (isInitialised) {
     
      console.log('IS INITIALIZED');
      
    }
    
    });
    });
    }
    
    listenToBeaconEvents() {
      this.events.subscribe('didEnterRegion', (data) => {
        this.zone.run(()=> {
          console.log('in Home.ts'+ data);
          console.log('Entered Region');
          this.localNotifications.schedule({
            id: 1,
            title:'SmartCafe',
            text: 'Welcome to Coffee Shop!',
            trigger: {at: new Date(new Date().getTime())}
          });
        }); 
      });
      this.events.subscribe('didExitRegion', (data) => {
        this.zone.run(()=> {
          console.log('Exited!');
          this.localNotifications.schedule({
            id: 2,
            title:'SmartCafe',
            text: 'Thanks for visiting us, hope to see you again soon!',
            trigger: {at: new Date(new Date().getTime())}
          });
        });
      });
      this.events.subscribe('didRangeBeaconsInRegion', (data) => {
        console.log('Inside Subscription');     
        this.zone.run(() => {
          console.log('INSIDE RUN');    
          this.isShelf = false;
          this.isPS4 = false;
          // // update the UI with the beacon list
          // let beaconList = data.beacons;
          // beaconList.forEach((beacon) => {
          //     this.beacons.push(beacon);
          // });   
          console.log("Beacon collected: " + JSON.stringify(data.beacon));          
        //  this.beacons.forEach((beacon)=> {
          //  if(beacon.proximity == 'ProximityImmediate') {
            const uuid = data.beacon.uuid.toUpperCase();
            this.http.get('http://10.25.159.146:3000/api/'+uuid+'/'+data.beacon.minor,{},{}).then(data=>{
                console.log('Received Http Data: ' + data.data);
                this.beaconTemp = data.data;
                console.log('This is this.beacon:'+this.beaconTemp);
            });
             switch(data.beacon.minor) {
               case '38872': 
              //  this.location = 'This is the Quiet Zone!';
              this.ibeacon.stopRangingBeaconsInRegion(data.beacon.region);
              this.isShelf = true;
               break;
               case '16549': 
              //  this.location = 'You are near the counter from where you can order!';
              this.ibeacon.stopRangingBeaconsInRegion(data.beacon.region);
               this.navCtrl.push(PinkPage);
               break;
               case '45700': 
              //  this.location = 'This is one of our PS4 tables, you can connect and play! for 10 AED/hr!';
              this.ibeacon.stopRangingBeaconsInRegion(data.beacon.region); 
               this.isPS4 = true;
               break;
               default: this.location = 'Nowhere Found!';
             }          
          //  }
           console.log('Location now is : ' + this.location);
           console.log('Just before craeeting alert');
          
        //  });   
        //  const alert = this.alertCtrl.create({
        //   title: 'Hello there!',
        //   subTitle: this.location,
        //   buttons: ['OK']
        // });
        // alert.present();     
        
       }); 
    });
      

    } 
 

}

import { Component, NgZone, OnDestroy } from '@angular/core';
import { NavController,Platform, Events } from 'ionic-angular';
import { IBeacon, IBeaconDelegate } from '@ionic-native/ibeacon';
import { NextPage } from '../next/next';
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
  nxtPage = NextPage;
  beacons = [];
  zone:any ;
  location: string = '';

  constructor(public alertCtrl: AlertController, public navCtrl: NavController, public platform: Platform,  
      public localNotifications: LocalNotifications,
     private ibeacon: IBeacon,public beaconProvider: BeaconProvider, public events: Events) {
      this.zone = new NgZone({ enableLongStackTrace: false });
  }

  ngOnDestroy() {
    this.events.unsubscribe('didEnterRegion');
    this.events.unsubscribe('didRangeBeaconsInRegion');
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
    console.log('PLATFORM READY');
    this.beaconProvider.initialise().then((isInitialised) => {
      console.log('NEVER INITIALIZEDDDDDD');
    if (isInitialised) {
     
      console.log('IS INITIALIZED');
      this.listenToBeaconEvents();
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
      this.events.subscribe('didRangeBeaconsInRegion', (beacon) => {
        console.log('Inside Subscription');     
        this.zone.run(() => {
          console.log('INSIDE RUN');    
          // // update the UI with the beacon list
          // let beaconList = data.beacons;
          // beaconList.forEach((beacon) => {
          //     this.beacons.push(beacon);
          // });   
          console.log("Beacon collected: " + JSON.stringify(beacon));          
        //  this.beacons.forEach((beacon)=> {
          //  if(beacon.proximity == 'ProximityImmediate') {
             switch(beacon.minor) {
               case '38872': 
              //  this.location = 'This is the back of the shop!';
               this.navCtrl.push(WhitePage);
               break;
               case '16549': 
              //  this.location = 'You are near the counter from where you can order!';
               this.navCtrl.push(PinkPage);
               break;
               case '45700': 
              //  this.location = 'This is one of our PS4 tables, you can connect and play! for 10 AED/hr!';
               this.navCtrl.push(YellowPage);
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

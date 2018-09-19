import { Component, NgZone, OnDestroy } from '@angular/core';
import { NavController,Platform, Events } from 'ionic-angular';
import { IBeacon, IBeaconDelegate } from '@ionic-native/ibeacon';
import { NextPage } from '../next/next';
import { BeaconProvider } from '../../services/beacon-provider';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AlertController } from 'ionic-angular';


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
  location: String = '';

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
      this.events.subscribe('didRangeBeaconsInRegion', (data) => {
        console.log('Inside Subscription');     
        this.zone.run(() => {
          console.log('INSIDE RUN');    
          // // update the UI with the beacon list
          let beaconList = data.beacons;
          beaconList.forEach((beacon) => {
              this.beacons.push(beacon);
          });   
          console.log(this.beacons);          
         this.beacons.forEach((beacon)=> {
           if(beacon.proximity == 'ProximityImmediate') {
             switch(beacon.minor) {
               case '38872': this.location = 'Bed';
               break;
               case '16549': this.location = 'Iron';
               break;
               case '45700': this.location = 'Store Room';
               break;
               default: this.location = 'Nowhere Found!';
             }          
           }
           console.log('Location now is : ' + this.location);
           console.log('Just before craeeting alert');
          
         });   
         const alert = this.alertCtrl.create({
          title: 'New Friend!',
          subTitle: 'You are in the ' + this.location + ' area',
          buttons: ['OK']
        });
        alert.present();     
        
       }); 
    });
      

    } 
 

}

import { Injectable, OnDestroy } from '@angular/core';
import { Platform, Events } from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';
import { LocalNotifications } from '@ionic-native/local-notifications';
/*
Generated class for the BeaconProvider provider.

See https://angular.io/docs/ts/latest/guide/dependency-injection.html
for more info on providers and Angular 2 DI.
*/
@Injectable()
export class BeaconProvider implements OnDestroy {

delegate: any;
region: any;
state: any;
beacon: any;

constructor(public platform: Platform, public events: Events, private ibeacon : IBeacon,
    public localNotifications: LocalNotifications,) {
}

ngOnDestroy() {
    // this.delegate.didEnterRegion().unsubscribe();
    // this.delegate.stopMonitoringForRegion(this.region);
}

findState():any {
    this.ibeacon.requestStateForRegion(this.region).then(success=>console.log('Request for state sent!'));
}

scanBeacons() {
    this.ibeacon.startRangingBeaconsInRegion(this.region)
    .then(
        () => {
            console.log('Started Ranging!');
        },
        error => {
            console.error('Failed to begin monitoring: ', error);
        }
    );
    this.delegate.didRangeBeaconsInRegion().subscribe(
        data => {
            if(data.beacons.length > 0 ){
                data.beacons.forEach((beacon)=>{
                    if(beacon.proximity == 'ProximityImmediate') {
                        console.log('Got data Ranging Beacons Publishing this data! -> ' + JSON.stringify(beacon));
                        // this.ibeacon.stopRangingBeaconsInRegion(this.region).then(()=> {
                        //     console.log('Stopped Ranging Beacons Now!');
                            this.events.publish('didRangeBeaconsInRegion', {beacon:beacon,region:this.region});
                        //  });
                    }
                })
               
            }    
        // this.ibeacon.stopRangingBeaconsInRegion(this.region);
        // this.ibeacon.stopMonitoringForRegion(this.region);
        },
        error => console.error()
        );

}

initialise(): any {
console.log('IS RANGIN AVAILABLE: '+this.ibeacon.isRangingAvailable().then(result => console.log(result))); 
let promise = new Promise((resolve, reject) => {
// we need to be running on a device
if (this.platform.is('cordova')) {

// create a new delegate and register it with the native layer
this.delegate = this.ibeacon.Delegate();

// Subscribe to some of the delegate’s event handlers
// this.delegate.didRangeBeaconsInRegion().subscribe(
// data => {
//     if(data.beacons.length > 0 ){
//         data.beacons.forEach((beacon)=>{
//             if(beacon.proximity == 'ProximityImmediate') {
//                 console.log('Got data Ranging Beacons Publishing this data! -> ' + JSON.stringify(beacon));
//                 this.ibeacon.stopRangingBeaconsInRegion(this.region).then(()=> {
//                     console.log('Stopped Ranging Beacons Now!');
//                     this.events.publish('didRangeBeaconsInRegion', {beacon:beacon,region:this.region});
//                  });
//             }
//         })
       
//     }    
// // this.ibeacon.stopRangingBeaconsInRegion(this.region);
// // this.ibeacon.stopMonitoringForRegion(this.region);
// },
// error => console.error()
// );

this.delegate.didEnterRegion().subscribe(
    data => {
        console.log('FOUND REGION, Publishing data');
        this.events.publish('didEnterRegion',data);
    }
)

this.delegate.didExitRegion().subscribe(
    data => {
        console.log('EXITED REGION, Publishing data');
        this.events.publish('didExitRegion',data);
    }
)


// setup a beacon region – CHANGE THIS TO YOUR OWN UUID
this.region = this.ibeacon.BeaconRegion('bedBeacons', 'B9407F30-F5F8-466E-AFF9-25556B579999',12870);
this.delegate.didDetermineStateForRegion().subscribe(data=>{
    // const data2 = JSON.parse(data);
    console.log('First Determine!');
    // console.log('second Determine:'+data.state);
    // console.log('third Determined'+ data.eventType);
    // console.log('fourth Determine'+ JSON.stringify(data2.state));
    console.log('Determined' + JSON.stringify(data));
    this.state = data.state;
    this.events.publish('region',{state:this.state});
    console.log('Fifth Determine:'+this.state);
});

    // this.ibeacon.startRangingBeaconsInRegion(this.region)
    //     .then(
    //         () => {
    //             console.log('Started Ranging!');
    //             resolve(true);
    //         },
    //         error => {
    //             console.error('Failed to begin monitoring: ', error);
    //             resolve(false);
    //         }
    //     );
this.ibeacon.startMonitoringForRegion(this.region).then(() => {
    console.log('Started monitoring for region!');
    resolve(true);
});
// this.delegate.requestStateForRegion(this.region).then(result => {
//     console.log('Requested: '+result);
// });
} else {
console.error('This application needs to be running on a device');
resolve(false);
}
});

return promise;
}
}
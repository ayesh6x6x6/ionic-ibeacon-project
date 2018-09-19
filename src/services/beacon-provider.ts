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

constructor(public platform: Platform, public events: Events, private ibeacon : IBeacon,
    public localNotifications: LocalNotifications,) {
}

ngOnDestroy() {
    // this.delegate.didEnterRegion().unsubscribe();
    // this.delegate.stopMonitoringForRegion(this.region);
}

initialise(): any {
console.log('IS RANGIN AVAILABLE: '+this.ibeacon.isRangingAvailable().then(result => console.log(result))); 
let promise = new Promise((resolve, reject) => {
// we need to be running on a device
if (this.platform.is('cordova')) {

// create a new delegate and register it with the native layer
this.delegate = this.ibeacon.Delegate();

// Subscribe to some of the delegate’s event handlers
this.delegate.didRangeBeaconsInRegion().subscribe(
data => {
    if(data.beacons.length > 0){
        console.log('Got data Ranging Beacons Publishing this data! -> ' + JSON.stringify(data));
        this.events.publish('didRangeBeaconsInRegion', data);
        this.ibeacon.stopRangingBeaconsInRegion(this.region).then(()=> {
            console.log('Stopped Ranging Beacons Now!');
         });
    }    
// this.ibeacon.stopRangingBeaconsInRegion(this.region);
// this.ibeacon.stopMonitoringForRegion(this.region);
},
error => console.error()
);

this.delegate.didEnterRegion().subscribe(
    data => {
        console.log('FOUND REGION, Publishing data');
        this.events.publish('didEnterRegion',data);
    }
)


// setup a beacon region – CHANGE THIS TO YOUR OWN UUID
this.region = this.ibeacon.BeaconRegion('bedBeacons', 'B9407F30-F5F8-466E-AFF9-25556B579999',12870);

console.log('Right before !');
this.delegate.didDetermineStateForRegion().subscribe(
    data => {
        console.log('Inside observable');
        console.log('Got Region State!' + data);
        this.state = data.state;
        if(this.state == 'CLRegionStateInside') {
            this.ibeacon.startRangingBeaconsInRegion(this.region)
                .then(
                    () => {
                        console.log('Started Ranging!');
                        resolve(true);
                    },
                    error => {
                        console.error('Failed to begin monitoring: ', error);
                        // resolve(false);
                    }
                );
        }
    }
);


this.ibeacon.startMonitoringForRegion(this.region).then(() => {
    console.log('Started monitoring for region!');
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
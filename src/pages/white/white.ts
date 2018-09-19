import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';

/**
 * Generated class for the WhitePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-white',
  templateUrl: 'white.html',
})
export class WhitePage {
  region: any;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public ibeacon: IBeacon) {
    this.region = this.ibeacon.BeaconRegion('bedBeacons', 'B9407F30-F5F8-466E-AFF9-25556B579999',12870);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WhitePage');
  }

  ionViewDidLeave() {
    this.ibeacon.startRangingBeaconsInRegion(this.region);
  }


}

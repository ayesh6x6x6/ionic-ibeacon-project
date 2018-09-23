import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';
import { ShelfDetailsPage } from '../shelf-details/shelf-details';

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
  shelfPage = ShelfDetailsPage;
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public ibeacon: IBeacon) {
    this.region = this.ibeacon.BeaconRegion('bedBeacons', 'B9407F30-F5F8-466E-AFF9-25556B579999',12870);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WhitePage');
  }

  ionViewWillUnload() {
    console.log('Started Ranging Again!!');
    this.ibeacon.startRangingBeaconsInRegion(this.region);
  }

  onLoadShelfPage() {
    console.log('Stopped Ranging!');
    this.ibeacon.stopRangingBeaconsInRegion(this.region);
    this.navCtrl.push(this.shelfPage);
  }



}

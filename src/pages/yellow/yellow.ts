import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';
import { InfoPage } from './info/info';

@Component({
  selector: 'page-yellow',
  templateUrl: 'yellow.html',
})
export class YellowPage implements OnInit {
  region:any;
  beacon:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public ibeacon: IBeacon) {
    this.region = this.ibeacon.BeaconRegion('bedBeacons', 'B9407F30-F5F8-466E-AFF9-25556B579999',12870);
    
  }

  onInfo() {
    this.ibeacon.stopRangingBeaconsInRegion(this.region);
    this.navCtrl.push(InfoPage, {beacon: this.beacon});
  }

  ngOnInit() {
    console.log('This is navparams: '+this.navParams.get('beacon'));
    this.beacon = JSON.parse(this.navParams.get('beacon'));
  }
  ionViewWillUnload() {
    console.log('Started Ranging Again!!');
    this.ibeacon.startRangingBeaconsInRegion(this.region);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad YellowPage');
  }


}

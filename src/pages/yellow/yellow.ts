import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { IBeacon } from '@ionic-native/ibeacon';

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

  ngOnInit() {
    console.log('This is navparams: '+this.navParams.get('beacon'));
    this.beacon = JSON.parse(this.navParams.get('beacon'));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad YellowPage');
  }

  ionViewDidLeave() {
    this.ibeacon.startRangingBeaconsInRegion(this.region);
  }


}

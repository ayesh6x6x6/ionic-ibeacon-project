import { Component, NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { connect, Client, IConnackPacket } from 'mqtt';

@Component({
  selector: 'page-shop-status',
  templateUrl: 'shop-status.html',
})
export class ShopStatusPage {
  client: Client;
  userTracker = [];
  temperature = 0;
  brightness = 0;
  sidetablebeacons = ['1859','58350'];
  businessbeacons = ['35730'];
  sidetables_available = 2;
  businesstables_available = 1;
  zone:any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.client = connect('mqtt://broker.hivemq.com/mqtt',{port:8000});
    this.client.on('message',(topic:string,payload:string)=>{
      const info = JSON.parse(payload);
      this.zone.run(()=>{
        this.userTracker = [];
        this.businesstables_available = 1;
        this.sidetables_available = 2;
        this.userTracker = info.tables;
        this.temperature = info.temperature;
        this.brightness = info.ambientLight;
        this.sidetablebeacons.forEach(beacon=>{
          if(this.userTracker.length > 0){
            if(this.userTracker.findIndex(track=>track.table == beacon)>=0){
              this.sidetables_available -= 1;
            }
          }        
        });
        this.businessbeacons.forEach(beacon=>{
          if(this.userTracker.length > 0){
            if(this.userTracker.findIndex(track=>track.table == beacon)>=0){
              this.businesstables_available -= 1;
            }
          }
        });
      });
    });
  }

  ionViewWillEnter(){
    this.client.subscribe('cafe/status');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShopStatusPage');
  }

}

import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-offers',
  templateUrl: 'offers.html',
})
export class OffersPage {
  offer = '';

  constructor(public navCtrl: NavController, public navParams: NavParams,private storage: Storage) {
  }

  ionViewWillEnter(){
    this.storage.get('Offer').then(offer=>{
      console.log('Retrieved offer:'+offer.offer);
      this.offer = offer.offer;
      console.log('This offer is:'+this.offer);
    });
  }

}

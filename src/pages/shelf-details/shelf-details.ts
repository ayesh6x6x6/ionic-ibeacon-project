import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-shelf-details',
  templateUrl: 'shelf-details.html',
})
export class ShelfDetailsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    
    console.log('ionViewDidLoad ShelfDetailsPage');
  }

  onShelfToHome() {
    this.navCtrl.popToRoot();
  }
}

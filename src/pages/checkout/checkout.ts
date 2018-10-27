import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html',
})
export class CheckoutPage implements OnInit {
  cartItems = [];
  total = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http:HTTP,
    private storage: Storage,private toastCtrl: ToastController) {
  }

  ngOnInit() {
    this.cartItems = this.navParams.get('cart');
    this.total = this.navParams.get('total');
  }

  onCash() {
    let toast = this.toastCtrl.create({
      message: 'Order has been submitted, head over to the counter!',
      duration: 3500,
      position: 'bottom'
    });
    this.storage.get('User').then(user=>{
      console.log('Found USer'+JSON.stringify(user));
      toast.present();
      this.http.post('http://10.25.159.146:3000/api/checkout',{total:this.total,cart:this.cartItems,user:user},{}).then(resp=>{

      });
    });
    
  }

}

import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { Storage } from '@ionic/storage';
import { connect, Client, IConnackPacket,IClientPublishOptions } from 'mqtt';

@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html',
})
export class CheckoutPage implements OnInit {
  cartItems = [];
  total = 0;
  client:Client;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http:HTTP,
    private storage: Storage,private toastCtrl: ToastController) {
      this.client = connect('mqtt://192.168.1.128',{port:3000});
      this.client.on('connect', ()=>{
        console.log('Phone connected to mqtt broker');
      });
      

      this.client.on('message', (topic: string, payload: string) => {

      } );
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
      this.http.post('https://smartcafeserver.herokuapp.com/api/checkout',{total:this.total,cart:this.cartItems,user:user},{}).then(resp=>{
        if(resp.status == 200) {
          this.client.publish(`cafe/orders/${user.username}`,JSON.stringify({total:this.total,cart:this.cartItems,user:user}));
        }
      });
      this.navCtrl.popToRoot();
    });
    
  }

}

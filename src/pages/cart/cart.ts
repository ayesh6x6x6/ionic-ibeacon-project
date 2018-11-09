import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HTTP } from '@ionic-native/http';
import { CheckoutPage } from '../checkout/checkout';

@Component({
  selector: 'page-cart',
  templateUrl: 'cart.html',
})
export class CartPage implements OnInit {
  cartItems:any = [];
  total = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http:HTTP) {
  }

  ngOnInit() {
    this.http.get('http://192.168.1.128:3005/api/getcartitems',{},{}).then(data=>{
      const items = JSON.parse(data.data);
      console.log('Response:'+data.data);
      items.cart.forEach((item)=>{
        const itemreal = JSON.parse(item);
        this.cartItems.push(itemreal);
        console.log('Item:'+JSON.stringify(itemreal));
        console.log('ItemName:'+itemreal.name);
        this.total += itemreal.price;
      });
      console.log('Items in cart:'+this.cartItems);
    });
  }

  removeItem(item:any) {
    console.log('Item to remove:'+JSON.stringify(item));
    const index = this.cartItems.indexOf(item);
    this.http.post('http://192.168.1.128:3005/api/removefromcart',{item:item},{}).then(data=>{
      console.log('Removed Item');
    })
    this.cartItems.splice(index,1);
    this.total -= item.price;
  }

  onCheckout() {
    this.navCtrl.push(CheckoutPage,{cart:this.cartItems,total:this.total});
  }


}

import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MenuController, App, NavController } from 'ionic-angular';
import { LandingPage } from '../../pages/landing/landing';
import { HTTP } from '@ionic-native/http';
import { connect, Client, IConnackPacket } from 'mqtt';
import { OffersPage } from '../../pages/offers/offers';
@Component({
  selector: 'header-menu',
  templateUrl: 'header-menu.html'
})
export class HeaderMenuComponent {
  client:Client

  constructor(public menuCtrl: MenuController,public app: App,public http:HTTP,public storage:Storage) {
    this.client = connect('mqtt://broker.hivemq.com/mqtt',{port:8000});
  }

  logoutClicked() {
    this.http.get('https://smartcafeserver.herokuapp.com/api/auth/logout',{},{}).then(data=>{
      this.storage.get('User').then(user=>{
        this.client.publish(`cafe/logout/${user.username}`,user.username);
      });      
      console.log('LoggedOut');
      this.storage.remove('User');
      //this.authService.logout();
      this.menuCtrl.close();
      var nav = this.app.getRootNav();
      nav.setRoot(LandingPage);
    });
    
  }

  onViewOffers(){
    var nav = this.app.getRootNav();
    nav.push(OffersPage);
  }

}

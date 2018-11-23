import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MenuController, App } from 'ionic-angular';
import { LandingPage } from '../../pages/landing/landing';
import { HTTP } from '@ionic-native/http';
import { connect, Client, IConnackPacket } from 'mqtt';
@Component({
  selector: 'header-menu',
  templateUrl: 'header-menu.html'
})
export class HeaderMenuComponent {
  client:Client

  constructor(public menuCtrl: MenuController,public app: App,public http:HTTP,public storage:Storage) {
    this.client = connect('mqtt://192.168.1.128',{port:3000});
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

}

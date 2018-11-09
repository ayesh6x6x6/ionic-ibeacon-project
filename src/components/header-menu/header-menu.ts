import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { MenuController, App } from 'ionic-angular';
import { LandingPage } from '../../pages/landing/landing';
import { HTTP } from '@ionic-native/http';
@Component({
  selector: 'header-menu',
  templateUrl: 'header-menu.html'
})
export class HeaderMenuComponent {


  constructor(public menuCtrl: MenuController,public app: App,public http:HTTP,public storage:Storage) {

  }

  logoutClicked() {
    this.http.get('http://192.168.1.128:3005/api/auth/logout',{},{}).then(data=>{
      console.log('LoggedOut');
      this.storage.remove('User');
      //this.authService.logout();
      this.menuCtrl.close();
      var nav = this.app.getRootNav();
      nav.setRoot(LandingPage);
    });
    
  }

}

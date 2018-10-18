import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { User } from '../../models/user';
import { NgForm } from '@angular/forms';
import { HTTP } from '@ionic-native/http';
import { UserPage } from '../user/user';

@Component({
  selector: 'page-landing',
  templateUrl: 'landing.html'
})
export class LandingPage implements OnInit {
  loginFlag:boolean = false;
  registerFlag:boolean = false;
  homePage = HomePage;
  userPage = UserPage;
  user: User = {
    email: '',
    username: '',
    password: ''
  }; 

  ngOnInit() {
    console.log('INISSSS');
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, private http: HTTP) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LandingPage');
  }

  onSelectLogin() {
    this.loginFlag = !this.loginFlag;
  }

  onGuestMode() {
    console.log('HERE AT LAST');
    this.navCtrl.push(this.homePage);
  }

  onSignin(form:NgForm) {
    this.http.post('http://10.25.159.146:3000/api/auth/login',this.user,{}).then(data=>{
      const resp = JSON.parse(data.data);
      console.log('Response from the server:'+resp.username);
      console.log("Username:"+JSON.stringify(resp));
      // console.log("Data is :"+ JSON.stringify(data.data.user.username)+":"+JSON.stringify(data.data.user.email));
      this.navCtrl.push(this.userPage,{username:resp.username,email:resp.email});
    })
  }

  onClickRegister(){
    this.registerFlag = !this.registerFlag;
  }

  onSignup(form:NgForm) {
    console.log("form value username:" + form.value.username );
    console.log("form value password:" + form.value.password );
    console.log("form value email:" + form.value.email );
    console.log("User value now is : "+ this.user.username + ":" + this.user.email + ":"+this.user.password);
    this.http.post('http://10.25.159.146:3000/api/auth/register',this.user,{}).then(data=>{
      console.log('Sent the post request');
      console.log('Response from server:'+JSON.parse(data.data));
      this.navCtrl.push(this.userPage,{username:form.value.username,email:form.value.email});
    });
  }

}

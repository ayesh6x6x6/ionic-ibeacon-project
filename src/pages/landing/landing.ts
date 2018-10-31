import { Component, OnInit, NgZone } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams, Events, LoadingController, ToastController, Toast } from 'ionic-angular';
import { HomePage } from '../home/home';
import { User } from '../../models/user';
import { NgForm } from '@angular/forms';
import { HTTP } from '@ionic-native/http';
import { UserPage } from '../user/user';
import { BeaconProvider } from '../../services/beacon-provider';
import { LocalNotifications } from '@ionic-native/local-notifications';

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
  zone:any;
  state:string = '';
  loading:boolean = false;

  ngOnInit() {
    console.log('INISSSS');
  }

  constructor(public navCtrl: NavController, public navParams: NavParams, private http: HTTP
    ,public beaconProvider: BeaconProvider,public events: Events,public localNotifications: LocalNotifications,
    private loadingCtrl:LoadingController,private storage: Storage, private toastCtrl:ToastController) {
      this.zone = new NgZone({ enableLongStackTrace: false });
      this.storage.get('User').then(user=>{
        if(user){
          console.log('Retrieved User from phone storage!');
          this.http.post('http://10.25.159.146:3000/api/auth/login',user,{}).then(data=>{
            const resp = JSON.parse(data.data);
            console.log('Response from the server:'+resp.username);
            console.log("Username:"+JSON.stringify(resp));
            // console.log("Data is :"+ JSON.stringify(data.data.user.username)+":"+JSON.stringify(data.data.user.email));
            this.loading = false;
            this.navCtrl.setRoot(this.userPage,{username:resp.username,email:resp.email,state:this.state});
          });
        }
      });
  }

  ionViewDidLoad() {
    this.events.subscribe('region',(data)=>{
      console.log('State in subs');
      console.log('State in data'+JSON.stringify(data));
      this.zone.run(()=>{
        console.log('State in reply:'+data.state);
        this.state = data.state;
      });
      
    });
    this.beaconProvider.initialise().then((isInitialised) => {
      console.log('NEVER INITIALIZEDDDDDD');
    if (isInitialised) {
     
      console.log('IS INITIALIZED');
      
    }
    
    });
    }

  ionViewWillEnter() {
    this.listenToBeaconEvents();
  }

  listenToBeaconEvents() {
    this.events.subscribe('didEnterRegion', (data) => {
      this.zone.run(()=> {
        console.log('in Home.ts'+ data);
        console.log('Entered Region');
        this.localNotifications.schedule({
          id: 1,
          title:'SmartCafe',
          text: 'Welcome to Coffee Shop!',
          trigger: {at: new Date(new Date().getTime())}
        });
      }); 
    });
    this.events.subscribe('didExitRegion', (data) => {
      this.zone.run(()=> {
        console.log('Exited!');
        this.localNotifications.schedule({
          id: 2,
          title:'SmartCafe',
          text: 'Thanks for visiting us, hope to see you again soon!',
          trigger: {at: new Date(new Date().getTime())}
        });
      });
    });
  }

  onSelectLogin() {
    this.loginFlag = !this.loginFlag;
  }

  onGuestMode() {
    console.log('HERE AT LAST');
    this.navCtrl.push(this.homePage);
  }

  onSignin(form:NgForm) {
    let loading = this.loadingCtrl.create({
      content:'Logging you in..',
      spinner: 'bubbles',
      dismissOnPageChange: true
    });
    loading.present();
    this.http.post('http://10.25.159.146:3000/api/auth/login',this.user,{}).then(data=>{
      const resp = JSON.parse(data.data);
      this.storage.set('User',{username:this.user.username,password:this.user.password,email:this.user.email}).then(done=>{
        console.log('Saved user in phone storage:'+this.user.username+":"+this.user.password+':'+this.user.email);
      });
      console.log('Response from the server:'+resp.username);
      console.log("Username:"+JSON.stringify(resp));
      // console.log("Data is :"+ JSON.stringify(data.data.user.username)+":"+JSON.stringify(data.data.user.email));
      this.loading = false;
      this.navCtrl.setRoot(this.userPage,{username:resp.username,email:resp.email});
    });
  }

  onClickRegister(){
    this.registerFlag = !this.registerFlag;
  }

  onSignup(form:NgForm) {
    console.log("form value username:" + form.value.username );
    console.log("form value password:" + form.value.password );
    console.log("form value email:" + form.value.email );
    console.log("User value now is : "+ this.user.username + ":" + this.user.email + ":"+this.user.password);
    let toast = this.toastCtrl.create({
      message: 'Registered User Successfully!',
      duration: 3000,
      position: 'bottom'
    });
    let loading = this.loadingCtrl.create({
      content:'Registering you',
      spinner: 'bubbles',
      dismissOnPageChange: true,
      showBackdrop: true
    });
    loading.present();
    this.http.post('http://10.25.159.146:3000/api/auth/register',this.user,{}).then(data=>{
      toast.present();
      console.log('Sent the post request');
      this.storage.set('User',{username:this.user.username,password:this.user.password,email:this.user.email}).then(done=>{
        console.log('Saved user in phone storage:'+this.user.username+":"+this.user.password+':'+this.user.email);
      });
      console.log('Response from server:'+JSON.parse(data.data));
      this.navCtrl.push(this.userPage,{username:form.value.username,email:form.value.email});
    });
  }

}

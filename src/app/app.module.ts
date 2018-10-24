import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { IBeacon } from '@ionic-native/ibeacon';
import { NextPage } from '../pages/next/next';
import { BeaconProvider } from '../services/beacon-provider';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { YellowPage } from '../pages/yellow/yellow';
import { PinkPage } from '../pages/pink/pink';
import { WhitePage } from '../pages/white/white';
import { ShelfDetailsPage } from '../pages/shelf-details/shelf-details';
import { HTTP } from '@ionic-native/http';
import { InfoPage } from '../pages/yellow/info/info';
import { GameDetailsPage } from '../pages/yellow/game-details/game-details';
import { StepsPsPage } from '../pages/yellow/steps-ps/steps-ps';
import { LandingPage } from '../pages/landing/landing';
import { UserPage } from '../pages/user/user';
import { HeaderMenuComponent } from '../components/header-menu/header-menu';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    NextPage,
    YellowPage,
    PinkPage,
    WhitePage,
    ShelfDetailsPage,
    InfoPage,
    GameDetailsPage,
    StepsPsPage,
    LandingPage,
    UserPage,
    HeaderMenuComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    NextPage,
    YellowPage,
    PinkPage,
    WhitePage,
    ShelfDetailsPage,
    InfoPage,
    GameDetailsPage,
    StepsPsPage,
    LandingPage,
    UserPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    IBeacon,
    BeaconProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LocalNotifications,
    HTTP
  ]
})
export class AppModule {}

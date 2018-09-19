import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { YellowPage } from './yellow';

@NgModule({
  declarations: [
    YellowPage,
  ],
  imports: [
    IonicPageModule.forChild(YellowPage),
  ],
})
export class YellowPageModule {}

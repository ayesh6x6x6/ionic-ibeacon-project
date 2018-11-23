import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShopStatusPage } from './shop-status';

@NgModule({
  declarations: [
    ShopStatusPage,
  ],
  imports: [
    IonicPageModule.forChild(ShopStatusPage),
  ],
})
export class ShopStatusPageModule {}

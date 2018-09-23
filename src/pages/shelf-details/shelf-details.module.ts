import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShelfDetailsPage } from './shelf-details';

@NgModule({
  declarations: [
    ShelfDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ShelfDetailsPage),
  ],
})
export class ShelfDetailsPageModule {}

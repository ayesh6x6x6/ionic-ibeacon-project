import { Component, OnInit } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";

@Component({
    selector:'page-info',
    templateUrl:'info.html'
})

export class InfoPage implements OnInit {
    beacon: any;

    constructor(public navCtrl: NavController, public navParams: NavParams) {}

    ngOnInit() {
        this.beacon = this.navParams.get('beacon');
    }

}
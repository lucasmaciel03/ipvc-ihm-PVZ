import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-test-links',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Test Links</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item routerLink="/explore">Explore</ion-item>
        <ion-item routerLink="/eventos">Eventos</ion-item>
        <ion-item routerLink="/avisos">Avisos</ion-item>
        <ion-item routerLink="/desporto">Desporto</ion-item>
        <ion-item routerLink="/turismo">Turismo</ion-item>
      </ion-list>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class TestLinksPage {}

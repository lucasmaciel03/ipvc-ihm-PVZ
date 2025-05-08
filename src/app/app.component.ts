import { Component } from '@angular/core';
import { IonicModule, AnimationController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class AppComponent {
  constructor(private animationCtrl: AnimationController) {
    // Set up custom transition animation
    this.setupCustomTransitions();
  }

  setupCustomTransitions() {
    this.animationCtrl
      .create()
      .duration(300)
      .easing('ease-in-out')
      .fromTo('opacity', 0, 1)
      .fromTo('transform', 'translateY(20px)', 'translateY(0px)')
      .beforeStyles({
        'transform-origin': 'center center',
      });
  }
}

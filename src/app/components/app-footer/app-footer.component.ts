import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, notificationsOutline, home, footballOutline, mapOutline } from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class AppFooterComponent {
  @Input() activePage:
    | 'eventos'
    | 'avisos'
    | 'explore'
    | 'desporto'
    | 'turismo' = 'explore';

  constructor(private router: Router, private navCtrl: NavController) {
    // Registrar os ícones utilizados no componente
    addIcons({
      'calendar-outline': calendarOutline,
      'notifications-outline': notificationsOutline,
      'home': home,
      'football-outline': footballOutline,
      'map-outline': mapOutline
    });
  }

  navigateTo(page: string): void {
    if (this.activePage !== page) {
      // Add a small visual indicator that the tab is being pressed
      const tabElement = document.querySelector(
        `.menu-item[data-page="${page}"]`
      );
      if (tabElement) {
        tabElement.classList.add('tapped');
        setTimeout(() => {
          tabElement.classList.remove('tapped');
        }, 200);
      }

      // First, apply a small delay before navigation to avoid toolbar overlap
      setTimeout(() => {
        // Use the NavController for smoother transitions
        this.navCtrl.navigateRoot(`/${page}`, {
          animated: true,
          animationDirection: 'forward',
        });
      }, 10);
    }
  }
}

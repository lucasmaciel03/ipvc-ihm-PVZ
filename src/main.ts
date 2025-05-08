import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicModule,
  IonicRouteStrategy,
  createAnimation,
  Animation,
} from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// Custom animation factory function with a proper type signature
function customNavAnimation(baseEl: HTMLElement, opts?: any): Animation {
  // Create default animation if opts not provided
  if (!opts || !opts.enteringEl || !opts.leavingEl) {
    return createAnimation().duration(300).easing('ease-in-out');
  }

  // Identify the headers and footers in both pages
  const enteringPage = opts.enteringEl;
  const leavingPage = opts.leavingEl;

  const enteringHeader = enteringPage.querySelector('ion-header');
  const leavingHeader = leavingPage.querySelector('ion-header');
  const enteringContent = enteringPage.querySelector('ion-content');
  const leavingContent = leavingPage.querySelector('ion-content');
  const enteringFooter = enteringPage.querySelector('ion-footer');
  const leavingFooter = leavingPage.querySelector('ion-footer');

  // Animation for the entire entering page (except header/footer)
  const enteringAnimation = createAnimation()
    .addElement(enteringPage)
    .duration(300)
    .easing('ease-in-out')
    .beforeStyles({
      'z-index': '1',
    })
    .fromTo('opacity', '0.01', '1');

  // Animation for the entering content only
  let enteringContentAnim;
  if (enteringContent) {
    enteringContentAnim = createAnimation()
      .addElement(enteringContent)
      .duration(300)
      .easing('ease-in-out')
      .fromTo('transform', 'translateY(20px)', 'translateY(0px)');
  }

  // Animation for the entire leaving page (except header/footer)
  const leavingAnimation = createAnimation()
    .addElement(leavingPage)
    .duration(250) // Make exit slightly faster
    .easing('ease-in-out')
    .beforeStyles({
      'z-index': '0',
    })
    .fromTo('opacity', '1', '0');

  // Create a parent animation that includes all children
  const pageTransition = createAnimation()
    .duration(300)
    .addAnimation([enteringAnimation, leavingAnimation]);

  // Only add content animation if element exists
  if (enteringContentAnim) {
    pageTransition.addAnimation(enteringContentAnim);
  }

  return pageTransition;
}

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(
      IonicModule.forRoot({
        animated: true, // Ensure animations are enabled
        navAnimation: customNavAnimation,
      })
    ),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules) // Preload all modules for faster transitions
    ),
    provideHttpClient(),
  ],
});

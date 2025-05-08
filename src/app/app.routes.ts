import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'explore',
    loadComponent: () =>
      import('./explore/explore.page').then((m) => m.ExplorePage),
  },
  {
    path: 'eventos',
    loadComponent: () =>
      import('./eventos-page/eventos-page.page').then((m) => m.EventosPagePage),
  },
  {
    path: 'avisos',
    loadComponent: () =>
      import('./avisos-page/avisos-page.page').then((m) => m.AvisosPagePage),
  },
  {
    path: 'desporto',
    loadComponent: () =>
      import('./desporto-page/desporto-page.page').then(
        (m) => m.DesportoPagePage
      ),
  },
  {
    path: 'turismo',
    loadComponent: () =>
      import('./turismo-page/turismo-page.page').then((m) => m.TurismoPagePage),
  },
  {
    path: 'test-links',
    loadComponent: () =>
      import('./test-links/test-links.page').then((m) => m.TestLinksPage),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

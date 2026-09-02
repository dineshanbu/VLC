import { Routes } from '@angular/router';

export const routes: Routes = [
  // ==========================================
  // PUBLIC ROUTES
  // ==========================================
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/home/home').then(m => m.HomeComponent),
      },
      {
        path: 'platform',
        loadComponent: () =>
          import('./features/public/platform/platform').then(m => m.PlatformComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/public/products/products').then(m => m.ProductsComponent),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/public/about/about').then(m => m.AboutComponent),
      },
      {
        path: 'partners',
        loadComponent: () =>
          import('./features/public/partners/partners').then(m => m.PartnersComponent),
      },
      {
        path: 'investors',
        loadComponent: () =>
          import('./features/public/investors/investors').then(m => m.InvestorsComponent),
      },
      {
        path: 'news',
        loadComponent: () =>
          import('./features/public/news/news').then(m => m.NewsComponent),
      },
      {
        path: 'careers',
        loadComponent: () =>
          import('./features/public/careers/careers').then(m => m.CareersComponent),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/public/contact/contact').then(m => m.ContactComponent),
      },
    ],
  },

  // ==========================================
  // ADMIN ROUTES
  // ==========================================
  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'content',
        loadComponent: () =>
          import('./features/admin/content-management/content-management').then(
            m => m.ContentManagementComponent
          ),
      },
      {
        path: 'news',
        loadComponent: () =>
          import('./features/admin/news-management/news-management').then(
            m => m.NewsManagementComponent
          ),
      },
      {
        path: 'careers',
        loadComponent: () =>
          import('./features/admin/careers-management/careers-management').then(
            m => m.CareersManagementComponent
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/settings/settings').then(m => m.SettingsComponent),
      },
    ],
  },

  // ==========================================
  // FALLBACK
  // ==========================================
  {
    path: '**',
    redirectTo: '',
  },
];

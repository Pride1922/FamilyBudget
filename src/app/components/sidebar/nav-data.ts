import { INavbarData } from './helper';

export const navbarData: INavbarData[] = [
  {
    routeLink: '/home',
    icon: 'fal fa-home',
    label: 'Home'
  },
  {
    routeLink: '/categories',
    icon: 'fal fa-list',
    label: 'Categories'
  },
  {
    routeLink: '/merchants',
    icon: 'fal fa-store',
    label: 'Merchants'
  },
  {
    routeLink: '/manage-users',
    icon: 'fal fa-users-cog',
    label: 'Manage Users'
  },
  {
    routeLink: '/profile',
    icon: 'fal fa-user-circle',
    label: 'Profile'
  },
  {
    routeLink: '/logout',
    icon: 'fal fa-sign-out',
    label: 'Logout'
  },
  {
    routeLink: '', // Empty string or some default value, as this item is not a clickable route
    icon: 'fal fa-globe',
    label: 'Language',
    items: [
      { routeLink: '/lang/en', label: 'English' },
      { routeLink: '/lang/pt', label: 'Portuguese' },
      { routeLink: '/lang/nl', label: 'Dutch' }
    ]
  }
];

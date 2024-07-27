import { INavbarData } from './helper';

export const navbarData: INavbarData[] = [
  {
    routeLink: '/home',
    icon: 'fal fa-home',
    label: 'HOME'
  },
  {
    routeLink: '/categories',
    icon: 'fal fa-list',
    label: 'CATEGORIES'
  },
  {
    routeLink: '/merchants',
    icon: 'fal fa-store',
    label: 'MERCHANTS'
  },
  {
    routeLink: '/manage-users',
    icon: 'fal fa-users-cog',
    label: 'MANAGE_USERS'
  },
  {
    routeLink: '/profile',
    icon: 'fal fa-user-circle',
    label: 'PROFILE'
  },
  {
    routeLink: '/logout',
    icon: 'fal fa-sign-out',
    label: 'LOGOUT'
  },
  {
    routeLink: '', // Not a clickable route, used for dropdown
    icon: 'fal fa-globe',
    label: 'LANGUAGE',
    items: [
      { routeLink: '/lang/en', label: 'ENGLISH', icon: 'assets/flags/en.ico' },
      { routeLink: '/lang/pt', label: 'PORTUGUESE', icon: 'assets/flags/pt.ico' },
      { routeLink: '/lang/nl', label: 'DUTCH', icon: 'assets/flags/nl.ico' }
    ]
  }
];

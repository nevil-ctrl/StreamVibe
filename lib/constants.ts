import type { MessageKey } from '@/lib/i18n/types';

export const NAV_LINKS: { href: string; labelKey: MessageKey }[] = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/browse', labelKey: 'nav.moviesShows' },
  { href: '/search', labelKey: 'nav.search' },
  { href: '/support', labelKey: 'nav.support' },
  { href: '/subscriptions', labelKey: 'nav.subscriptions' },
];

export const MAIN_MENU: {
  nameKey: MessageKey;
  icon: string;
  path: string;
}[] = [
  { nameKey: 'sidebar.dashboard', icon: 'LayoutDashboard', path: '/user/profile' },
  { nameKey: 'sidebar.history', icon: 'History', path: '/user/history' },
  { nameKey: 'sidebar.watched', icon: 'Film', path: '/user/watched' },
  { nameKey: 'sidebar.favorites', icon: 'Heart', path: '/user/favorites' },
  { nameKey: 'sidebar.myList', icon: 'ListPlus', path: '/user/my-list' },
  { nameKey: 'sidebar.subscription', icon: 'CreditCard', path: '/user/subscription' },
  { nameKey: 'sidebar.notifications', icon: 'Bell', path: '/user/notifications' },
  { nameKey: 'sidebar.support', icon: 'LifeBuoy', path: '/user/support' },
];

export const SETTINGS_MENU: {
  nameKey: MessageKey;
  icon: string;
  path: string;
}[] = [
  { nameKey: 'sidebar.settings', icon: 'Settings', path: '/user/settings' },
];

export const ADMIN_MENU: { nameKey: MessageKey; icon: string; path: string }[] =
  [
    { nameKey: 'sidebar.dashboard', icon: 'LayoutDashboard', path: '/admin/dashboard' },
    { nameKey: 'sidebar.users', icon: 'Users', path: '/admin/users' },
    { nameKey: 'sidebar.tickets', icon: 'MessageSquare', path: '/admin/tickets' },
    { nameKey: 'sidebar.broadcasts', icon: 'Bell', path: '/admin/notifications' },
    { nameKey: 'sidebar.analytics', icon: 'BarChart2', path: '/admin/analytics' },
  ];

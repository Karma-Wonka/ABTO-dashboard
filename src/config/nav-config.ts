import { NavGroup } from '@/types';

/**
 * Navigation configuration with permission-based visibility.
 *
 * Used for both the sidebar navigation and the Cmd+K bar. Items are
 * organized into groups, each rendered with a SidebarGroupLabel.
 *
 * Add `access: { permission: 'members:write' }` to restrict an item to
 * sessions holding that permission key; omit `access` to show it to any
 * signed-in user. See src/hooks/use-nav.ts and src/lib/rbac.ts.
 */
export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      }
    ]
  },
  {
    label: 'ABTO',
    items: [
      {
        title: 'Members',
        url: '/dashboard/members',
        icon: 'teams',
        shortcut: ['m', 'e'],
        isActive: false,
        items: []
      },
      {
        title: 'Events',
        url: '/dashboard/events',
        icon: 'kanban',
        shortcut: ['e', 'v'],
        isActive: false,
        items: []
      },
      {
        title: 'News',
        url: '/dashboard/news',
        icon: 'chat',
        shortcut: ['n', 'w'],
        isActive: false,
        items: []
      },
      {
        title: 'Documents',
        url: '/dashboard/documents',
        icon: 'product',
        shortcut: ['d', 'c'],
        isActive: false,
        items: []
      },
      {
        title: 'Committee',
        url: '/dashboard/committee',
        icon: 'teams',
        shortcut: ['c', 'm'],
        isActive: false,
        access: { permission: 'committee:read' },
        items: []
      },
      {
        title: 'Festivals',
        url: '/dashboard/festivals',
        icon: 'calendar',
        shortcut: ['f', 't'],
        isActive: false,
        access: { permission: 'festivals:read' },
        items: []
      },
      {
        title: 'Destinations',
        url: '/dashboard/destinations',
        icon: 'galleryVerticalEnd',
        shortcut: ['d', 'e'],
        isActive: false,
        access: { permission: 'destinations:read' },
        items: []
      },
      {
        title: 'Site Content',
        url: '/dashboard/site-content',
        icon: 'forms',
        shortcut: ['s', 'c'],
        isActive: false,
        access: { permission: 'site-content:manage' },
        items: []
      },
      {
        title: 'Submissions',
        url: '/dashboard/submissions',
        icon: 'send',
        shortcut: ['s', 'u'],
        isActive: false,
        access: { permission: 'submissions:read' },
        items: []
      },
      {
        title: 'Users',
        url: '/dashboard/users',
        icon: 'teams',
        shortcut: ['u', 'u'],
        isActive: false,
        access: { permission: 'users:read' },
        items: []
      },
      {
        title: 'Account',
        url: '#',
        icon: 'account',
        isActive: false,
        items: [
          {
            title: 'Profile',
            url: '/dashboard/profile',
            icon: 'profile',
            shortcut: ['m', 'm']
          },
          {
            title: 'Notifications',
            url: '/dashboard/notifications',
            icon: 'notification',
            shortcut: ['n', 'n']
          }
        ]
      }
    ]
  },
  {
    label: 'Access Control',
    items: [
      {
        title: 'Roles',
        url: '/dashboard/roles',
        icon: 'lock',
        shortcut: ['r', 'o'],
        isActive: false,
        access: { permission: 'roles:manage' },
        items: []
      },
      {
        title: 'Permissions',
        url: '/dashboard/permissions',
        icon: 'adjustments',
        shortcut: ['p', 'e'],
        isActive: false,
        access: { permission: 'roles:manage' },
        items: []
      },
      {
        title: 'Accounts',
        url: '/dashboard/accounts',
        icon: 'userPen',
        shortcut: ['a', 'c'],
        isActive: false,
        access: { permission: 'accounts:manage' },
        items: []
      }
    ]
  }
];

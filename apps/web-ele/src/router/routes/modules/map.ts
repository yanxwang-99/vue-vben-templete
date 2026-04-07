import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'Map',
    path: '/map',
    meta: {
      icon: 'lucide:map',
      order: 10,
      title: $t('page.map.title'),
    },
    children: [
      {
        name: 'MapUnified',
        path: '/map/unified',
        component: () => import('#/views/map/unified/index.vue'),
        meta: {
          icon: 'lucide:map-pin',
          title: $t('page.map.unified'),
        },
      },
    ],
  },
];

export default routes;

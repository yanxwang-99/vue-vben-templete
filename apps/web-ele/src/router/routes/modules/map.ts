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
        name: 'MapSingleMarker',
        path: '/map/single-marker',
        component: () => import('#/views/map/single-marker/index.vue'),
        meta: {
          icon: 'lucide:map-pin',
          title: $t('page.map.singleMarker'),
        },
      },
      {
        name: 'MapScatterPoints',
        path: '/map/scatter-points',
        component: () => import('#/views/map/scatter-points/index.vue'),
        meta: {
          icon: 'lucide:map-pinned',
          title: $t('page.map.scatterPoints'),
        },
      },
      {
        name: 'MapTrajectory',
        path: '/map/trajectory',
        component: () => import('#/views/map/trajectory/index.vue'),
        meta: {
          icon: 'lucide:route',
          title: $t('page.map.trajectory'),
        },
      },
    ],
  },
];

export default routes;

import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'MapMarking',
    path: '/map-marking',
    component: () => import('#/views/map/unified/index.vue'),
    meta: {
      icon: 'lucide:map-pin',
      order: 5,
      title: $t('page.map.marking'),
    },
  },
];

export default routes;

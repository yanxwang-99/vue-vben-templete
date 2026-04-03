import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig(async () => {
  return {
    application: {
      pwaOptions: {
        manifest: {
          description: 'Vben Admin is a modern admin dashboard template based on Vue 3.',
          icons: [
            {
              sizes: '192x192',
              src: '/images/pwa-icon-192.png',
              type: 'image/png',
            },
            {
              sizes: '512x512',
              src: '/images/pwa-icon-512.png',
              type: 'image/png',
            },
          ],
          name: 'Vben Admin',
          short_name: 'Vben Admin',
        },
      },
    },
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
      ],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
          // 离线地图资源代理
          '/map-server': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/map-server/, ''),
            target: 'http://localhost:8081',
          },
        },
      },
    },
  };
});

<script lang="ts" setup>
import type { MapContainerProps } from '../types';

import { ref } from 'vue';

import { useBaseMap } from '../composables/use-base-map';

defineOptions({ name: 'MapContainer' });

const props = withDefaults(defineProps<MapContainerProps>(), {
  center: () => [120.3119, 31.4912],
  zoom: 12,
  styleUrl: '/map-server/style.json',
});

const containerRef = ref<HTMLElement>();

const { map, loading } = useBaseMap({
  container: containerRef,
  styleUrl: props.styleUrl,
  center: props.center,
  zoom: props.zoom,
  minZoom: props.minZoom,
  maxZoom: props.maxZoom,
});

// 暴露 map 实例和状态给父组件
defineExpose({
  map,
  loading,
});
</script>

<template>
  <div class="relative h-full w-full overflow-hidden">
    <!-- 地图容器 -->
    <div ref="containerRef" class="h-full w-full"></div>

    <!-- 加载状态遮罩 -->
    <div
      v-if="loading"
      class="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/80"
    >
      <div class="flex flex-col items-center gap-2">
        <div
          class="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
        ></div>
        <span class="text-sm text-gray-500">地图加载中...</span>
      </div>
    </div>

    <!-- 插槽：用于添加额外的覆盖物或控件 -->
    <slot :map="map" :loading="loading"></slot>
  </div>
</template>

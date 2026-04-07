<script lang="ts" setup>
import { ref } from 'vue';

import { MapUnified } from '@vben/map-ui';

defineOptions({ name: 'MapUnifiedPage' });

// ============ 类型定义 ============
interface MapPoint {
  lng: number;
  lat: number;
  timestamp: number;
  action: string;
}

// ============ 数据源 ============
const dataPoints = ref<MapPoint[]>(generateSampleData());

function generateSampleData(): MapPoint[] {
  const baseTime = Date.now() - 3600 * 1000;
  const centerLng = 120.3119;
  const centerLat = 31.4912;
  const actions = ['停留', '移动', '拍照', '打卡', '休息'];
  const points: MapPoint[] = [];

  const pointCount = 20;
  for (let i = 0; i < pointCount; i++) {
    const p = i / (pointCount - 1);
    const angle = p * Math.PI * 3;
    const radius = 0.005 + p * 0.015;

    points.push({
      lng: centerLng + Math.cos(angle) * radius,
      lat: centerLat + Math.sin(angle) * radius,
      timestamp: baseTime + i * 180_000,
      action: actions[Math.floor(Math.random() * actions.length)]!,
    });
  }

  return points;
}

function refreshData() {
  dataPoints.value = generateSampleData();
}

function handlePointClick(data: MapPoint & { index: number }) {
  console.log('Point clicked:', data);
}
</script>

<template>
  <div class="h-full w-full">
    <MapUnified
      :center="[120.3119, 31.4912]"
      :zoom="13"
      :points="dataPoints"
      @point-click="handlePointClick"
    />

    <!-- 左下角刷新按钮 -->
    <button
      class="absolute bottom-4 left-4 z-20 flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm text-gray-600 shadow-lg transition-colors hover:bg-gray-50"
      @click="refreshData"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
      刷新数据
    </button>
  </div>
</template>

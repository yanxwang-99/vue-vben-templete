<script lang="ts" setup>
import { ref } from 'vue';

import { MapUnified } from '@vben-core/map-ui';

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
  const baseTime = Date.now() - 7200 * 1000; // 2小时前开始
  const centerLng = 120.3119;
  const centerLat = 31.4912;
  const actions = ['停留', '移动', '拍照', '打卡', '休息'];
  const points: MapPoint[] = [];

  // 1. 主要轨迹路径 (15个点，模拟移动路线)
  const trajectoryPoints = [
    [0, 0], [-0.008, 0.005], [-0.012, 0.012], [-0.01, 0.02],
    [-0.005, 0.025], [0.005, 0.022], [0.012, 0.018], [0.018, 0.012],
    [0.02, 0.005], [0.018, -0.005], [0.012, -0.012], [0.005, -0.018],
    [-0.005, -0.02], [-0.012, -0.015], [-0.008, -0.008],
  ];

  for (let i = 0; i < trajectoryPoints.length; i++) {
    const [offsetLng, offsetLat] = trajectoryPoints[i]!;
    points.push({
      lng: centerLng + offsetLng,
      lat: centerLat + offsetLat,
      timestamp: baseTime + i * 300_000, // 每5分钟一个点
      action: i === 0 || i === 5 || i === 10 ? '打卡' : (Math.random() > 0.7 ? '拍照' : '移动'),
    });
  }

  // 2. 热点区域1 - 商业区 (20个点聚集)
  const hotSpot1 = { lng: centerLng - 0.005, lat: centerLat + 0.008 };
  for (let i = 0; i < 20; i++) {
    points.push({
      lng: hotSpot1.lng + (Math.random() - 0.5) * 0.006,
      lat: hotSpot1.lat + (Math.random() - 0.5) * 0.006,
      timestamp: baseTime + Math.random() * 7200_000,
      action: actions[Math.floor(Math.random() * actions.length)]!,
    });
  }

  // 3. 热点区域2 - 公园 (15个点聚集)
  const hotSpot2 = { lng: centerLng + 0.012, lat: centerLat - 0.003 };
  for (let i = 0; i < 15; i++) {
    points.push({
      lng: hotSpot2.lng + (Math.random() - 0.5) * 0.005,
      lat: hotSpot2.lat + (Math.random() - 0.5) * 0.005,
      timestamp: baseTime + Math.random() * 7200_000,
      action: actions[Math.floor(Math.random() * actions.length)]!,
    });
  }

  // 4. 热点区域3 - 地铁站 (12个点聚集)
  const hotSpot3 = { lng: centerLng + 0.003, lat: centerLat + 0.015 };
  for (let i = 0; i < 12; i++) {
    points.push({
      lng: hotSpot3.lng + (Math.random() - 0.5) * 0.004,
      lat: hotSpot3.lat + (Math.random() - 0.5) * 0.004,
      timestamp: baseTime + Math.random() * 7200_000,
      action: actions[Math.floor(Math.random() * actions.length)]!,
    });
  }

  // 5. 随机分散点 (18个点)
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.01 + Math.random() * 0.015;
    points.push({
      lng: centerLng + Math.cos(angle) * radius,
      lat: centerLat + Math.sin(angle) * radius,
      timestamp: baseTime + Math.random() * 7200_000,
      action: actions[Math.floor(Math.random() * actions.length)]!,
    });
  }

  // 按时间排序
  return points.sort((a, b) => a.timestamp - b.timestamp);
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

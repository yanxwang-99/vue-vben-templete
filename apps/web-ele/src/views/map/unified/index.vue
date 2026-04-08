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

  for (const [i, trajectoryPoint] of trajectoryPoints.entries()) {
    const [offsetLng = 0, offsetLat = 0] = trajectoryPoint ?? [0, 0];
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
      timestamp: baseTime + Math.random() * 7_200_000,
      action: actions[Math.floor(Math.random() * actions.length)]!,
    });
  }

  // 3. 热点区域2 - 公园 (15个点聚集)
  const hotSpot2 = { lng: centerLng + 0.012, lat: centerLat - 0.003 };
  for (let i = 0; i < 15; i++) {
    points.push({
      lng: hotSpot2.lng + (Math.random() - 0.5) * 0.005,
      lat: hotSpot2.lat + (Math.random() - 0.5) * 0.005,
      timestamp: baseTime + Math.random() * 7_200_000,
      action: actions[Math.floor(Math.random() * actions.length)]!,
    });
  }

  // 4. 热点区域3 - 地铁站 (12个点聚集)
  const hotSpot3 = { lng: centerLng + 0.003, lat: centerLat + 0.015 };
  for (let i = 0; i < 12; i++) {
    points.push({
      lng: hotSpot3.lng + (Math.random() - 0.5) * 0.004,
      lat: hotSpot3.lat + (Math.random() - 0.5) * 0.004,
      timestamp: baseTime + Math.random() * 7_200_000,
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
      timestamp: baseTime + Math.random() * 7_200_000,
      action: actions[Math.floor(Math.random() * actions.length)]!,
    });
  }

  // 按时间排序
  return points.toSorted((a, b) => a.timestamp - b.timestamp);
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
  </div>
</template>

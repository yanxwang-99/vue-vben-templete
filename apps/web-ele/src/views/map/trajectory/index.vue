<script lang="ts" setup>
import { ref } from 'vue';

import { MapTrajectory } from '@vben/map-ui';

import MapMarkerInfo from '#/components/map-marker-info.vue';

defineOptions({ name: 'MapTrajectoryPage' });

const trajectoryPoints = ref(generateTrajectoryData());

function generateTrajectoryData() {
  const baseTime = Date.now() - 3600 * 1000;
  const centerLng = 120.3119;
  const centerLat = 31.4912;
  const points = [];

  const pointCount = 30;
  for (let i = 0; i < pointCount; i++) {
    const p = i / (pointCount - 1);
    const angle = p * Math.PI * 4;
    const radius = 0.01 + p * 0.02;
    const speed = 30 + Math.floor(Math.random() * 50);

    points.push({
      lng: centerLng + Math.cos(angle) * radius,
      lat: centerLat + Math.sin(angle) * radius,
      timestamp: baseTime + i * 120_000,
      speed,
      altitude: 20 + Math.floor(Math.random() * 15),
    });
  }

  return points;
}

function regenerateTrajectory() {
  trajectoryPoints.value = generateTrajectoryData();
  panelVisible.value = false;
}

// 信息面板状态
const panelVisible = ref(false);
const panelData = ref<{
  fields: { label: string; tag?: boolean; tagType?: 'danger' | 'info' | 'primary' | 'success' | 'warning'; value: number | string; }[];
  lat: number;
  lng: number;
  subtitle: string;
  title: string;
}>({
  title: '',
  subtitle: '',
  lng: 0,
  lat: 0,
  fields: [],
});

function handleMarkerClick(data: Record<string, any>) {
  const speed = (data.speed as number) ?? 0;
  const speedTagType = speed > 60 ? 'danger' : (speed > 40 ? 'warning' : 'success');

  const timestamp = data.timestamp as number;
  const timeStr = timestamp ? new Date(timestamp).toLocaleString() : '-';

  panelData.value = {
    title: `轨迹点 #${((data.index as number) ?? 0) + 1}`,
    subtitle: timeStr,
    lng: data.lng,
    lat: data.lat,
    fields: [
      { label: '序号', value: ((data.index as number) ?? 0) + 1 },
      { label: '速度', value: `${speed} km/h`, tag: true, tagType: speedTagType },
      { label: '海拔', value: `${data.altitude ?? '-'} m` },
      { label: '时间', value: timeStr },
    ],
  };
  panelVisible.value = true;
}

function handlePanelClose() {
  panelVisible.value = false;
}
</script>

<template>
  <div class="relative h-full w-full">
    <MapTrajectory
      :center="[120.3119, 31.4912]"
      :points="trajectoryPoints"
      :zoom="13"
      :auto-play="false"
      :play-speed="300"
      @marker-click="handleMarkerClick"
    />

    <MapMarkerInfo
      :visible="panelVisible"
      :title="panelData.title"
      :subtitle="panelData.subtitle"
      :lng="panelData.lng"
      :lat="panelData.lat"
      :fields="panelData.fields"
      @close="handlePanelClose"
    />

    <!-- 重新生成按钮 -->
    <button
      class="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm text-gray-600 shadow-lg hover:bg-gray-50"
      @click="regenerateTrajectory"
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
      重新生成轨迹
    </button>
  </div>
</template>

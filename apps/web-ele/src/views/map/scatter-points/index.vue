<script lang="ts" setup>
import { ref } from 'vue';

import { MapScatterPoints } from '@vben/map-ui';

import MapMarkerInfo from '#/components/map-marker-info.vue';

defineOptions({ name: 'MapScatterPointsPage' });

const scatterPoints = ref(generateRandomPoints());

function generateRandomPoints() {
  const centerLng = 120.3119;
  const centerLat = 31.4912;
  const types = ['商场', '学校', '医院', '公园', '住宅'];
  const typeColors: Record<string, string> = {
    商场: 'warning',
    学校: 'primary',
    医院: 'danger',
    公园: 'success',
    住宅: 'info',
  };
  const points = [];

  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)]!;
    points.push({
      lng: centerLng + (Math.random() - 0.5) * 0.05,
      lat: centerLat + (Math.random() - 0.5) * 0.05,
      name: `位置 ${i + 1}`,
      type,
      score: Math.floor(Math.random() * 100),
      typeColor: typeColors[type],
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][
        Math.floor(Math.random() * 5)
      ],
    });
  }

  return points;
}

function refreshPoints() {
  scatterPoints.value = generateRandomPoints();
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

const typeTagMap: Record<string, 'danger' | 'info' | 'primary' | 'success' | 'warning'> = {
  商场: 'warning',
  学校: 'primary',
  医院: 'danger',
  公园: 'success',
  住宅: 'info',
};

function handleMarkerClick(data: Record<string, any>) {
  const score = data.score as number;
  const scoreTagType = score >= 80 ? 'success' : score >= 60 ? 'primary' : score >= 40 ? 'warning' : 'danger';

  panelData.value = {
    title: data.name ?? '未知位置',
    subtitle: `类型：${data.type ?? '未分类'}`,
    lng: data.lng,
    lat: data.lat,
    fields: [
      { label: '类型', value: data.type ?? '-', tag: true, tagType: typeTagMap[data.type] ?? 'info' },
      { label: '评分', value: `${score} 分`, tag: true, tagType: scoreTagType },
      { label: '区域', value: '无锡市梁溪区' },
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
    <MapScatterPoints
      :center="[120.3119, 31.4912]"
      :points="scatterPoints"
      :zoom="13"
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

    <!-- 刷新按钮 -->
    <button
      class="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm text-gray-600 shadow-lg hover:bg-gray-50"
      @click="refreshPoints"
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
      刷新散点
    </button>
  </div>
</template>

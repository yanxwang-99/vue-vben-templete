<script lang="ts" setup>
import { ref } from 'vue';

import { MapSingleMarker } from '@vben/map-ui';

import MapMarkerInfo from '#/components/map-marker-info.vue';

defineOptions({ name: 'MapSingleMarkerPage' });

// 示例标记数据（无锡市中心）
const markerData = {
  lng: 120.3119,
  lat: 31.4912,
  color: '#EF4444',
};

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
  panelData.value = {
    title: '无锡中心',
    subtitle: '江苏省无锡市梁溪区',
    lng: data.lng,
    lat: data.lat,
    fields: [
      { label: '类型', value: '商业综合体', tag: true, tagType: 'primary' },
      { label: '区域', value: '梁溪区', tag: true, tagType: 'success' },
      { label: '状态', value: '正常运营', tag: true, tagType: 'success' },
      { label: '描述', value: '无锡中心是无锡市梁溪区的地标性商业综合体' },
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
    <MapSingleMarker
      :center="[120.3119, 31.4912]"
      :marker="markerData"
      :zoom="14"
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
  </div>
</template>

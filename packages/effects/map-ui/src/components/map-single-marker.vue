<script lang="ts" setup>
import type { MapSingleMarkerProps } from '../types';

import { ref, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import MapContainer from './map-container.vue';

defineOptions({ name: 'MapSingleMarker' });

const props = withDefaults(defineProps<MapSingleMarkerProps>(), {
  center: () => [120.3119, 31.4912],
  zoom: 14,
  styleUrl: '/map-server/style.json',
});

const emit = defineEmits<{
  (e: 'marker-click', data: { lng: number; lat: number; [key: string]: any }): void;
}>();

const mapContainerRef = ref<InstanceType<typeof MapContainer>>();

let markerInstance: maplibregl.Marker | null = null;

function upsertMarker(map: maplibregl.Map) {
  const { marker } = props;
  if (!marker) return;

  removeMarker();

  // 外层容器 - MapLibre 用于定位
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width: 30px; height: 30px;';

  // 内层元素 - 视觉样式
  const el = document.createElement('div');
  el.className = 'map-marker-dot';
  el.style.cssText = `
    width: 30px; height: 30px; cursor: pointer;
    background: ${marker.color ?? '#EF4444'};
    border: 3px solid #fff; border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    transition: transform 0.2s, box-shadow 0.2s;
  `;
  el.addEventListener('mouseenter', () => {
    el.style.transform = 'rotate(-45deg) scale(1.15)';
    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'rotate(-45deg) scale(1)';
    el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  });
  el.addEventListener('click', () => {
    emit('marker-click', { ...marker });
  });

  wrapper.appendChild(el);

  markerInstance = new maplibregl.Marker({ element: wrapper })
    .setLngLat([marker.lng, marker.lat])
    .addTo(map);
}

function removeMarker() {
  markerInstance?.remove();
  markerInstance = null;
}

watch(
  () => mapContainerRef.value?.loading,
  (isLoading) => {
    if (!isLoading && mapContainerRef.value?.map) {
      upsertMarker(mapContainerRef.value.map);
    }
  },
);

watch(
  () => props.marker,
  () => {
    if (mapContainerRef.value?.map && !mapContainerRef.value.loading) {
      upsertMarker(mapContainerRef.value.map);
    }
  },
  { deep: true },
);
</script>

<template>
  <MapContainer
    ref="mapContainerRef"
    :center="center"
    :max-zoom="maxZoom"
    :min-zoom="minZoom"
    :style-url="styleUrl"
    :zoom="zoom"
  />
</template>

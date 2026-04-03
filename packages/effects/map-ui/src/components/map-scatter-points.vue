<script lang="ts" setup>
import type { MapScatterPointsProps } from '../types';

import { ref, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import MapContainer from './map-container.vue';

defineOptions({ name: 'MapScatterPoints' });

const props = withDefaults(defineProps<MapScatterPointsProps>(), {
  center: () => [120.3119, 31.4912],
  zoom: 12,
  styleUrl: '/map-server/style.json',
  defaultColor: '#3B82F6',
});

const emit = defineEmits<{
  (e: 'marker-click', data: { lng: number; lat: number; [key: string]: any }): void;
}>();

const mapContainerRef = ref<InstanceType<typeof MapContainer>>();

let markerInstances: maplibregl.Marker[] = [];

function addScatterMarkers(map: maplibregl.Map) {
  removeScatterMarkers();

  if (props.points.length === 0) return;

  for (const point of props.points) {
    const color = point.color ?? props.defaultColor;

    // 外层容器 - MapLibre 用于定位
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width: 24px; height: 24px;';

    // 内层元素 - 视觉样式
    const el = document.createElement('div');
    el.style.cssText = `
      width: 24px; height: 24px; cursor: pointer;
      background: ${color};
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
      emit('marker-click', { ...point });
    });

    wrapper.appendChild(el);

    const marker = new maplibregl.Marker({ element: wrapper })
      .setLngLat([point.lng, point.lat])
      .addTo(map);

    markerInstances.push(marker);
  }

  fitBounds(map);
}

function fitBounds(map: maplibregl.Map) {
  if (props.points.length === 0) return;
  const bounds = new maplibregl.LngLatBounds();
  for (const point of props.points) {
    bounds.extend([point.lng, point.lat]);
  }
  map.fitBounds(bounds, { padding: 50, maxZoom: 16 });
}

function removeScatterMarkers() {
  for (const marker of markerInstances) {
    marker.remove();
  }
  markerInstances = [];
}

watch(
  () => mapContainerRef.value?.loading,
  (isLoading) => {
    if (!isLoading && mapContainerRef.value?.map) {
      addScatterMarkers(mapContainerRef.value.map);
    }
  },
);

watch(
  () => props.points,
  () => {
    const map = mapContainerRef.value?.map;
    if (map && !mapContainerRef.value?.loading) {
      addScatterMarkers(map);
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

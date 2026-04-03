<script lang="ts" setup>
import type { MapTrajectoryProps, TrajectoryPoint } from '../types';

import { ref, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import MapContainer from './map-container.vue';

defineOptions({ name: 'MapTrajectory' });

const props = withDefaults(defineProps<MapTrajectoryProps>(), {
  center: () => [120.3119, 31.4912],
  zoom: 12,
  styleUrl: '/map-server/style.json',
  lineColor: '#3B82F6',
  lineWidth: 4,
  pointColor: '#EF4444',
  autoPlay: false,
  playSpeed: 500,
});

const emit = defineEmits<{
  (e: 'marker-click', data: {
    lng: number;
    lat: number;
    timestamp?: number;
    index: number;
    [key: string]: any;
  }): void;
}>();

const LINE_SOURCE_ID = 'trajectory-line-source';
const LINE_LAYER_ID = 'trajectory-line-layer';

const mapContainerRef = ref<InstanceType<typeof MapContainer>>();

const isPlaying = ref(false);
const currentIndex = ref(0);
const progress = ref(0);
let movingMarker: maplibregl.Marker | null = null;
let animationTimer: ReturnType<typeof setTimeout> | null = null;
let pointMarkers: maplibregl.Marker[] = [];

function toLineGeoJSON(
  points: TrajectoryPoint[],
): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: points.map((p) => [p.lng, p.lat]),
    },
    properties: {},
  };
}

function addTrajectoryLayers(map: maplibregl.Map) {
  removeTrajectoryLayers(map);

  if (props.points.length === 0) return;

  // 添加轨迹线
  map.addSource(LINE_SOURCE_ID, {
    type: 'geojson',
    data: toLineGeoJSON(props.points),
  });

  map.addLayer({
    id: LINE_LAYER_ID,
    type: 'line',
    source: LINE_SOURCE_ID,
    paint: {
      'line-color': props.lineColor,
      'line-width': props.lineWidth,
      'line-opacity': 0.8,
    },
  });

  // 添加轨迹点 Marker
  addPointMarkers(map);

  // 创建移动标记
  createMovingMarker(map);

  fitBounds(map);

  if (props.autoPlay) {
    play();
  }
}

function addPointMarkers(map: maplibregl.Map) {
  removePointMarkers();

  for (let i = 0; i < props.points.length; i++) {
    const point = props.points[i]!;

    // 外层容器 - MapLibre 用于定位
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width: 24px; height: 24px;';

    // 内层元素 - 视觉样式
    const el = document.createElement('div');
    el.style.cssText = `
      width: 24px; height: 24px; cursor: pointer;
      background: ${props.pointColor};
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
      emit('marker-click', { ...point, index: i });
    });

    wrapper.appendChild(el);

    const marker = new maplibregl.Marker({ element: wrapper })
      .setLngLat([point.lng, point.lat])
      .addTo(map);

    pointMarkers.push(marker);
  }
}

function removePointMarkers() {
  for (const marker of pointMarkers) {
    marker.remove();
  }
  pointMarkers = [];
}

function createMovingMarker(map: maplibregl.Map) {
  if (props.points.length === 0) return;
  removeMovingMarker();

  // 外层容器 - MapLibre 用于定位
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width: 20px; height: 20px;';

  // 内层元素 - 视觉样式
  const el = document.createElement('div');
  el.style.cssText =
    'width: 20px; height: 20px; background: #10B981; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4);';

  wrapper.appendChild(el);

  const firstPoint = props.points[0]!;
  movingMarker = new maplibregl.Marker({ element: wrapper })
    .setLngLat([firstPoint.lng, firstPoint.lat])
    .addTo(map);
}

function fitBounds(map: maplibregl.Map) {
  if (props.points.length === 0) return;
  const bounds = new maplibregl.LngLatBounds();
  for (const point of props.points) {
    bounds.extend([point.lng, point.lat]);
  }
  map.fitBounds(bounds, { padding: 50, maxZoom: 16 });
}

function removeTrajectoryLayers(map: maplibregl.Map) {
  stop();
  if (map.getLayer(LINE_LAYER_ID)) {
    map.removeLayer(LINE_LAYER_ID);
  }
  if (map.getSource(LINE_SOURCE_ID)) {
    map.removeSource(LINE_SOURCE_ID);
  }
  removePointMarkers();
  removeMovingMarker();
}

function removeMovingMarker() {
  movingMarker?.remove();
  movingMarker = null;
}

function play() {
  if (props.points.length < 2) return;
  isPlaying.value = true;

  function step() {
    if (!isPlaying.value || !movingMarker) return;
    if (currentIndex.value >= props.points.length - 1) {
      isPlaying.value = false;
      return;
    }
    currentIndex.value++;
    progress.value = currentIndex.value / (props.points.length - 1);
    const point = props.points[currentIndex.value]!;
    movingMarker.setLngLat([point.lng, point.lat]);
    animationTimer = setTimeout(step, props.playSpeed);
  }

  step();
}

function stop() {
  isPlaying.value = false;
  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }
}

function reset() {
  stop();
  currentIndex.value = 0;
  progress.value = 0;
  if (movingMarker && props.points.length > 0) {
    const firstPoint = props.points[0]!;
    movingMarker.setLngLat([firstPoint.lng, firstPoint.lat]);
  }
}

function seek(index: number) {
  stop();
  currentIndex.value = Math.min(index, props.points.length - 1);
  progress.value = currentIndex.value / Math.max(props.points.length - 1, 1);
  if (movingMarker && props.points[currentIndex.value]) {
    const point = props.points[currentIndex.value]!;
    movingMarker.setLngLat([point.lng, point.lat]);
  }
}

watch(
  () => mapContainerRef.value?.loading,
  (isLoading) => {
    if (!isLoading && mapContainerRef.value?.map) {
      addTrajectoryLayers(mapContainerRef.value.map);
    }
  },
);

watch(
  () => props.points,
  () => {
    const map = mapContainerRef.value?.map;
    if (map && !mapContainerRef.value?.loading) {
      reset();
      addTrajectoryLayers(map);
    }
  },
  { deep: true },
);

defineExpose({ play, stop, reset, seek, isPlaying, currentIndex, progress });
</script>

<template>
  <div class="relative h-full w-full">
    <MapContainer
      ref="mapContainerRef"
      :center="center"
      :max-zoom="maxZoom"
      :min-zoom="minZoom"
      :style-url="styleUrl"
      :zoom="zoom"
    />

    <!-- 播放控制面板 -->
    <div
      class="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-white/90 px-4 py-2 shadow-lg backdrop-blur"
    >
      <button
        class="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
        title="重置"
        @click="reset"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
      </button>

      <button
        class="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
        :title="isPlaying ? '暂停' : '播放'"
        @click="isPlaying ? stop() : play()"
      >
        <svg
          v-if="isPlaying"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </button>

      <div class="flex w-48 items-center">
        <input
          :max="points.length - 1"
          :min="0"
          :value="currentIndex"
          class="h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-300 accent-blue-500"
          step="1"
          type="range"
          @input="seek(Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <span class="min-w-16 text-right text-xs text-gray-500">
        {{ currentIndex + 1 }} / {{ points.length }}
      </span>
    </div>

    <slot
      :current-index="currentIndex"
      :is-playing="isPlaying"
      :map="mapContainerRef?.map"
      :play="play"
      :progress="progress"
      :reset="reset"
      :seek="seek"
      :stop="stop"
    />
  </div>
</template>

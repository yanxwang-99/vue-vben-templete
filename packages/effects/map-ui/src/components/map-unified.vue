<script lang="ts" setup>
import type { MapContainerProps } from '../types';

import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';

import { VbenButton, VbenButtonGroup } from '@vben-core/shadcn-ui';

import maplibregl from 'maplibre-gl';

import { useBaseMap } from '../composables/use-base-map';
import MapMarkerInfo from './map-marker-info.vue';

// ============ 类型定义 ============
interface MapPoint {
  lng: number;
  lat: number;
  timestamp: number;
  action: string;
}

interface InfoField {
  label: string;
  value: number | string;
  tag?: boolean;
  tagType?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
}

// ============ Props ============
const props = withDefaults(
  defineProps<MapContainerProps & { points?: MapPoint[] }>(),
  {
    center: () => [120.3119, 31.4912],
    zoom: 13,
    styleUrl: '/map-server/style.json',
    points: () => [],
  },
);

const emit = defineEmits<{
  (e: 'point-click', data: MapPoint & { index: number }): void;
}>();

// ============ 地图初始化 ============
const containerRef = ref<HTMLElement>();

const { map, loading } = useBaseMap({
  container: containerRef,
  styleUrl: props.styleUrl,
  center: props.center,
  zoom: props.zoom,
  minZoom: props.minZoom,
  maxZoom: props.maxZoom,
});

// ============ 状态 ============
type DisplayMode = 'none' | 'scatter' | 'trajectory';
const mode = ref<DisplayMode>('none');
const isPlaying = ref(false);
const currentIndex = ref(0);

// 面板状态
const panelVisible = ref(false);
const panelTitle = ref('');
const panelSubtitle = ref('');
const panelLng = ref(0);
const panelLat = ref(0);
const panelFields = ref<InfoField[]>([]);

// ============ 地图要素管理 ============
const markerInstances = shallowRef<maplibregl.Marker[]>([]);
const trajectoryLine = shallowRef<null | { layer: string; source: string }>(
  null,
);
const movingMarker = shallowRef<maplibregl.Marker | null>(null);
const clickMarker = shallowRef<maplibregl.Marker | null>(null);
let animationTimer: null | ReturnType<typeof setTimeout> = null;

// ============ 创建水滴标记元素 ============
function createDropletElement(
  color: string,
  size = 28,
  number?: number,
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `width: ${size}px; height: ${size}px; cursor: pointer;`;

  const el = document.createElement('div');
  el.style.cssText = `
    width: ${size}px; height: ${size}px;
    background: ${color};
    border: 3px solid #fff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, box-shadow 0.2s;
  `;

  if (number !== undefined) {
    const numSpan = document.createElement('span');
    numSpan.textContent = String(number);
    numSpan.style.cssText = `transform: rotate(45deg); color: #fff; font-size: ${
      size * 0.35
    }px; font-weight: bold;`;
    el.append(numSpan);
  }

  wrapper.append(el);

  wrapper.addEventListener('mouseenter', () => {
    el.style.transform = 'rotate(-45deg) scale(1.15)';
    el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
  });
  wrapper.addEventListener('mouseleave', () => {
    el.style.transform = 'rotate(-45deg) scale(1)';
    el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  });

  return wrapper;
}

// ============ 点击地图 ============
function handleMapClick(e: maplibregl.MapMouseEvent) {
  const { lng, lat } = e.lngLat;

  // 创建水滴标记
  createClickMarker(lng, lat);

  // 显示信息框
  panelTitle.value = '坐标位置';
  panelSubtitle.value = '';
  panelLng.value = lng;
  panelLat.value = lat;
  panelFields.value = [];
  panelVisible.value = true;
}

function createClickMarker(lng: number, lat: number) {
  if (!map.value) return;

  clickMarker.value?.remove();

  const wrapper = createDropletElement('#EF4444', 30);
  const marker = new maplibregl.Marker({ element: wrapper })
    .setLngLat([lng, lat])
    .addTo(map.value);

  clickMarker.value = marker;
}

// ============ 撒点模式 ============
function enableScatterMode() {
  clearAllMarkers();
  mode.value = 'scatter';
  panelVisible.value = false;

  if (!map.value || props.points.length === 0) return;

  const markers: maplibregl.Marker[] = [];

  for (let i = 0; i < props.points.length; i++) {
    const point = props.points[i]!;

    const wrapper = createDropletElement('#3B82F6', 28, i + 1);

    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      showPointInfo(point, i);
    });

    const marker = new maplibregl.Marker({ element: wrapper })
      .setLngLat([point.lng, point.lat])
      .addTo(map.value);

    markers.push(marker);
  }

  markerInstances.value = markers;
  fitBounds();
}

// ============ 轨迹回放模式 ============
function enableTrajectoryMode() {
  clearAllMarkers();
  mode.value = 'trajectory';
  panelVisible.value = false;
  stopAnimation();

  if (!map.value || props.points.length < 2) return;

  // 绘制轨迹线
  const sourceId = 'trajectory-line-source';
  const layerId = 'trajectory-line-layer';

  if (map.value.getSource(sourceId)) {
    map.value.removeLayer(layerId);
    map.value.removeSource(sourceId);
  }

  map.value.addSource(sourceId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: props.points.map((p) => [p.lng, p.lat]),
      },
      properties: {},
    },
  });

  map.value.addLayer({
    id: layerId,
    type: 'line',
    source: sourceId,
    paint: {
      'line-color': '#3B82F6',
      'line-width': 4,
      'line-opacity': 0.8,
    },
  });

  trajectoryLine.value = { source: sourceId, layer: layerId };

  // 添加轨迹点标记
  const markers: maplibregl.Marker[] = [];

  for (let i = 0; i < props.points.length; i++) {
    const point = props.points[i]!;

    const wrapper = createDropletElement('#EF4444', 24, i + 1);

    wrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      showPointInfo(point, i);
    });

    const marker = new maplibregl.Marker({ element: wrapper })
      .setLngLat([point.lng, point.lat])
      .addTo(map.value);

    markers.push(marker);
  }

  markerInstances.value = markers;

  // 创建移动标记
  createMovingMarker();

  fitBounds();
}

// ============ 移动标记 ============
function createMovingMarker() {
  if (!map.value || props.points.length === 0) return;

  removeMovingMarker();

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width: 20px; height: 20px;';

  const el = document.createElement('div');
  el.style.cssText = `
    width: 20px; height: 20px;
    background: #10B981;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  `;

  wrapper.append(el);

  const firstPoint = props.points[0]!;
  movingMarker.value = new maplibregl.Marker({ element: wrapper })
    .setLngLat([firstPoint.lng, firstPoint.lat])
    .addTo(map.value);
}

function removeMovingMarker() {
  movingMarker.value?.remove();
  movingMarker.value = null;
}

// ============ 轨迹回放控制 ============
function play() {
  if (props.points.length < 2) return;
  isPlaying.value = true;

  function step() {
    if (!isPlaying.value || !movingMarker.value) return;

    if (currentIndex.value >= props.points.length - 1) {
      isPlaying.value = false;
      return;
    }

    currentIndex.value++;
    const point = props.points[currentIndex.value]!;
    movingMarker.value.setLngLat([point.lng, point.lat]);

    animationTimer = setTimeout(step, 500);
  }

  step();
}

function pause() {
  isPlaying.value = false;
  if (animationTimer) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }
}

function stopAnimation() {
  pause();
  currentIndex.value = 0;

  if (movingMarker.value && props.points.length > 0) {
    const firstPoint = props.points[0]!;
    movingMarker.value.setLngLat([firstPoint.lng, firstPoint.lat]);
  }
}

function seek(index: number) {
  pause();
  currentIndex.value = Math.max(0, Math.min(index, props.points.length - 1));

  if (movingMarker.value) {
    const point = props.points[currentIndex.value]!;
    movingMarker.value.setLngLat([point.lng, point.lat]);
  }
}

// ============ 显示点信息 ============
function showPointInfo(point: MapPoint, index: number) {
  panelTitle.value = `数据点 #${index + 1}`;
  panelSubtitle.value = '';
  panelLng.value = point.lng;
  panelLat.value = point.lat;

  const actionTagType =
    (
      {
        停留: 'info',
        移动: 'success',
        拍照: 'warning',
        打卡: 'primary',
        休息: 'warning',
      } as Record<string, InfoField['tagType']>
    )[point.action] || 'info';

  panelFields.value = [
    { label: '序号', value: index + 1, tag: true, tagType: 'primary' },
    {
      label: '时间',
      value: new Date(point.timestamp).toLocaleString(),
    },
    { label: '动作', value: point.action, tag: true, tagType: actionTagType },
  ];
  panelVisible.value = true;

  emit('point-click', { ...point, index });
}

// ============ 清理 ============
function clearAllMarkers() {
  for (const marker of markerInstances.value) {
    marker.remove();
  }
  markerInstances.value = [];

  if (map.value && trajectoryLine.value) {
    if (map.value.getLayer(trajectoryLine.value.layer)) {
      map.value.removeLayer(trajectoryLine.value.layer);
    }
    if (map.value.getSource(trajectoryLine.value.source)) {
      map.value.removeSource(trajectoryLine.value.source);
    }
    trajectoryLine.value = null;
  }

  removeMovingMarker();
  stopAnimation();

  clickMarker.value?.remove();
  clickMarker.value = null;
}

function clearMode() {
  clearAllMarkers();
  mode.value = 'none';
  panelVisible.value = false;
}

function fitBounds() {
  if (!map.value || props.points.length === 0) return;

  const bounds = new maplibregl.LngLatBounds();
  for (const point of props.points) {
    bounds.extend([point.lng, point.lat]);
  }
  map.value.fitBounds(bounds, { padding: 80, maxZoom: 16 });
}

function handlePanelClose() {
  panelVisible.value = false;
}

// ============ 生命周期 ============
onMounted(() => {
  if (map.value) {
    map.value.on('click', handleMapClick);
  }
});

onUnmounted(() => {
  if (map.value) {
    map.value.off('click', handleMapClick);
  }
  clearAllMarkers();
});

watch(
  () => loading.value,
  (isLoading) => {
    if (!isLoading && map.value) {
      map.value.on('click', handleMapClick);
    }
  },
);

// ============ 暴露方法 ============
defineExpose({
  play,
  pause,
  reset: stopAnimation,
  seek,
  isPlaying,
  currentIndex,
});
</script>

<template>
  <div class="relative h-full w-full">
    <!-- 地图容器 -->
    <div ref="containerRef" class="h-full w-full"></div>

    <!-- 加载状态 -->
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

    <!-- 左上角工具栏 -->
    <div class="absolute left-4 top-4 z-10">
      <div
        class="rounded-lg border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur"
      >
        <div class="flex flex-col gap-3">
          <div class="text-xs font-medium text-gray-500">显示模式</div>
          <VbenButtonGroup>
            <VbenButton
              :variant="mode === 'none' ? 'default' : 'outline'"
              size="sm"
              @click="clearMode"
            >
              清除
            </VbenButton>
            <VbenButton
              :variant="mode === 'scatter' ? 'default' : 'outline'"
              size="sm"
              @click="enableScatterMode"
            >
              撒点
            </VbenButton>
            <VbenButton
              :variant="mode === 'trajectory' ? 'default' : 'outline'"
              size="sm"
              @click="enableTrajectoryMode"
            >
              轨迹
            </VbenButton>
          </VbenButtonGroup>

          <!-- 轨迹回放控制 -->
          <template v-if="mode === 'trajectory'">
            <div class="h-px bg-gray-200"></div>
            <div class="flex flex-col gap-2">
              <VbenButtonGroup>
                <VbenButton size="sm" variant="outline" @click="stopAnimation">
                  重置
                </VbenButton>
                <VbenButton
                  size="sm"
                  :variant="isPlaying ? 'secondary' : 'default'"
                  @click="isPlaying ? pause() : play()"
                >
                  {{ isPlaying ? '暂停' : '播放' }}
                </VbenButton>
              </VbenButtonGroup>
              <div class="flex items-center gap-2">
                <span class="min-w-12 text-right text-xs text-gray-500">
                  {{ currentIndex + 1 }}/{{ points.length }}
                </span>
                <input
                  :max="points.length - 1"
                  :min="0"
                  :value="currentIndex"
                  class="h-1 w-24 cursor-pointer appearance-none rounded-full bg-gray-300"
                  step="1"
                  type="range"
                  @input="
                    seek(Number(($event.target as HTMLInputElement).value))
                  "
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 右侧信息面板 -->
    <MapMarkerInfo
      :visible="panelVisible"
      :title="panelTitle"
      :subtitle="panelSubtitle"
      :lng="panelLng"
      :lat="panelLat"
      :fields="panelFields"
      @close="handlePanelClose"
    />

    <!-- 底部提示 -->
    <div
      class="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-white/90 px-3 py-2 text-xs text-gray-500 shadow-lg"
    >
      点击地图查看坐标 | 点击标记点查看详情
    </div>
  </div>
</template>

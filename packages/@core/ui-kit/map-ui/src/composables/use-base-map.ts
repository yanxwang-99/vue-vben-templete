import type { MapOptions } from 'maplibre-gl';

import type { Ref, ShallowRef } from 'vue';

import type { UseBaseMapOptions, UseBaseMapReturn } from '../types';

import { onMounted, onUnmounted, ref, shallowRef } from 'vue';

import { useResizeObserver } from '@vueuse/core';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

import 'maplibre-gl/dist/maplibre-gl.css';

// PMTiles 协议单例注册标记
let protocolRegistered = false;

/**
 * 确保 PMTiles 协议已注册（全局单例）
 */
function ensurePmtilesProtocol() {
  if (!protocolRegistered) {
    const protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    protocolRegistered = true;
  }
}

/**
 * 基础地图 Composable
 *
 * 封装 MapLibre GL JS + PMTiles 初始化逻辑，提供响应式的地图实例和加载状态
 *
 * @param options 配置选项
 * @returns 地图实例、加载状态、resize 方法
 */
export function useBaseMap(options: UseBaseMapOptions): UseBaseMapReturn {
  const {
    container,
    styleUrl = '/map-server/style.json',
    center = [120.3119, 31.4912],
    zoom = 12,
    minZoom,
    maxZoom,
  } = options;

  const map = shallowRef<maplibregl.Map | null>(null);
  const loading = ref(true);

  // 监听容器尺寸变化，自动调用 map.resize()
  useResizeObserver(container, () => {
    map.value?.resize();
  });

  onMounted(() => {
    // 确保 PMTiles 协议已注册
    ensurePmtilesProtocol();

    if (!container.value) {
      console.warn('[useBaseMap] Container element is not available');
      return;
    }

    const mapOptions: MapOptions = {
      container: container.value,
      style: styleUrl,
      center: center as [number, number],
      zoom,
      minZoom,
      maxZoom,
    };

    const mapInstance = new maplibregl.Map(mapOptions);

    // 地图加载完成回调
    mapInstance.on('load', () => {
      loading.value = false;
    });

    // 错误处理
    mapInstance.on('error', (e) => {
      console.error('[useBaseMap] Map error:', e.error);
    });

    map.value = mapInstance;
  });

  onUnmounted(() => {
    map.value?.remove();
    map.value = null;
  });

  /**
   * 手动触发地图 resize
   */
  function resize() {
    map.value?.resize();
  }

  return {
    map: map as Readonly<ShallowRef<maplibregl.Map | null>>,
    loading: loading as Readonly<Ref<boolean>>,
    resize,
  };
}

// 导出 maplibregl 供外部使用
export { maplibregl };

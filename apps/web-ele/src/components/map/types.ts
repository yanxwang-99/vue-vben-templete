import type maplibregl from 'maplibre-gl';

import type { Ref, ShallowRef } from 'vue';

/**
 * 单点标记数据
 */
export interface MarkerData {
  /** 标记颜色 */
  color?: string;
  /** 纬度 */
  lat: number;
  /** 经度 */
  lng: number;
  /** 弹窗 HTML 内容 */
  popupHtml?: string;
}

/**
 * 散点数据
 */
export interface ScatterPoint {
  /** 自定义属性 */
  [key: string]: any;
  /** 点的颜色 */
  color?: string;
  /** 纬度 */
  lat: number;
  /** 经度 */
  lng: number;
  /** 点的半径 */
  radius?: number;
}

/**
 * 轨迹点数据
 */
export interface TrajectoryPoint {
  /** 自定义属性 */
  [key: string]: any;
  /** 纬度 */
  lat: number;
  /** 经度 */
  lng: number;
  /** 时间戳 (毫秒) */
  timestamp: number;
}

/**
 * 热力图配置选项
 */
export interface HeatmapOptions {
  /** 热力图颜色渐变 */
  colors?: Array<{ color: string; stop: number }>;
  /** 强度 (0-1) */
  intensity?: number;
  /** 不透明度 (0-1) */
  opacity?: number;
  /** 半径 (像素) */
  radius?: number;
}

/**
 * 地图容器组件 Props
 */
export interface MapContainerProps {
  /** 地图中心点 [lng, lat] */
  center?: [number, number];
  /** 最大缩放级别 */
  maxZoom?: number;
  /** 最小缩放级别 */
  minZoom?: number;
  /** 样式 URL，默认通过 Vite 代理访问 */
  styleUrl?: string;
  /** 缩放级别 */
  zoom?: number;
}

/**
 * 地图数据点（用于统一地图组件）
 */
export interface MapPoint {
  /** 动作类型 */
  action: string;
  /** 纬度 */
  lat: number;
  /** 经度 */
  lng: number;
  /** 时间戳 (毫秒) */
  timestamp: number;
}

/**
 * 信息框字段
 */
export interface InfoField {
  /** 字段标签 */
  label: string;
  /** 是否显示为标签 */
  tag?: boolean;
  /** 标签类型 */
  tagType?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
  /** 字段值 */
  value: number | string;
}

/**
 * 信息框组件 Props
 */
export interface MapMarkerInfoProps {
  /** 自定义字段 */
  fields?: InfoField[];
  /** 纬度 */
  lat?: number;
  /** 经度 */
  lng?: number;
  /** 副标题 */
  subtitle?: string;
  /** 标题 */
  title?: string;
  /** 是否显示 */
  visible: boolean;
}

/**
 * 统一地图组件 Props
 */
export interface MapUnifiedProps extends MapContainerProps {
  /** 数据点集合 */
  points?: MapPoint[];
}

/**
 * 单点标记组件 Props
 */
export interface MapSingleMarkerProps extends MapContainerProps {
  /** 标记数据 */
  marker: MarkerData;
}

/**
 * 多点散列组件 Props
 */
export interface MapScatterPointsProps extends MapContainerProps {
  /** 默认点的颜色 */
  defaultColor?: string;
  /** 默认点的半径 */
  defaultRadius?: number;
  /** 散点数据数组 */
  points: ScatterPoint[];
}

/**
 * 轨迹回放组件 Props
 */
export interface MapTrajectoryProps extends MapContainerProps {
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 轨迹线颜色 */
  lineColor?: string;
  /** 轨迹线宽度 */
  lineWidth?: number;
  /** 播放速度（毫秒/点） */
  playSpeed?: number;
  /** 轨迹点颜色 */
  pointColor?: string;
  /** 轨迹点半径 */
  pointRadius?: number;
  /** 轨迹点数据数组（按时间顺序） */
  points: TrajectoryPoint[];
}

/**
 * useBaseMap composable 选项
 */
export interface UseBaseMapOptions {
  /** 中心点 */
  center?: [number, number];
  /** 地图容器元素的 ref */
  container: Readonly<Ref<HTMLElement | null | undefined>>;
  /** 最大缩放 */
  maxZoom?: number;
  /** 最小缩放 */
  minZoom?: number;
  /** 样式 URL */
  styleUrl?: string;
  /** 缩放级别 */
  zoom?: number;
}

/**
 * useBaseMap composable 返回值
 */
export interface UseBaseMapReturn {
  /** 加载状态 */
  loading: Readonly<Ref<boolean>>;
  /** MapLibre Map 实例 */
  map: Readonly<ShallowRef<maplibregl.Map | null>>;
  /** 手动触发 resize */
  resize: () => void;
}

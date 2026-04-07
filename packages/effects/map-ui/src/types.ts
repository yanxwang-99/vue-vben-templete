import type { Ref, ShallowRef } from 'vue';
import type maplibregl from 'maplibre-gl';

/**
 * 单点标记数据
 */
export interface MarkerData {
  /** 经度 */
  lng: number;
  /** 纬度 */
  lat: number;
  /** 标记颜色 */
  color?: string;
  /** 弹窗 HTML 内容 */
  popupHtml?: string;
}

/**
 * 散点数据
 */
export interface ScatterPoint {
  /** 经度 */
  lng: number;
  /** 纬度 */
  lat: number;
  /** 点的颜色 */
  color?: string;
  /** 点的半径 */
  radius?: number;
  /** 自定义属性 */
  [key: string]: any;
}

/**
 * 轨迹点数据
 */
export interface TrajectoryPoint {
  /** 经度 */
  lng: number;
  /** 纬度 */
  lat: number;
  /** 时间戳 (毫秒) */
  timestamp: number;
  /** 自定义属性 */
  [key: string]: any;
}

/**
 * 地图容器组件 Props
 */
export interface MapContainerProps {
  /** 地图中心点 [lng, lat] */
  center?: [number, number];
  /** 缩放级别 */
  zoom?: number;
  /** 样式 URL，默认通过 Vite 代理访问 */
  styleUrl?: string;
  /** 最小缩放级别 */
  minZoom?: number;
  /** 最大缩放级别 */
  maxZoom?: number;
}

/**
 * 地图数据点（用于统一地图组件）
 */
export interface MapPoint {
  /** 经度 */
  lng: number;
  /** 纬度 */
  lat: number;
  /** 时间戳 (毫秒) */
  timestamp: number;
  /** 动作类型 */
  action: string;
}

/**
 * 信息框字段
 */
export interface InfoField {
  /** 字段标签 */
  label: string;
  /** 字段值 */
  value: string | number;
  /** 是否显示为标签 */
  tag?: boolean;
  /** 标签类型 */
  tagType?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
}

/**
 * 信息框组件 Props
 */
export interface MapMarkerInfoProps {
  /** 是否显示 */
  visible: boolean;
  /** 标题 */
  title?: string;
  /** 副标题 */
  subtitle?: string;
  /** 经度 */
  lng?: number;
  /** 纬度 */
  lat?: number;
  /** 自定义字段 */
  fields?: InfoField[];
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
  /** 散点数据数组 */
  points: ScatterPoint[];
  /** 默认点的颜色 */
  defaultColor?: string;
  /** 默认点的半径 */
  defaultRadius?: number;
}

/**
 * 轨迹回放组件 Props
 */
export interface MapTrajectoryProps extends MapContainerProps {
  /** 轨迹点数据数组（按时间顺序） */
  points: TrajectoryPoint[];
  /** 轨迹线颜色 */
  lineColor?: string;
  /** 轨迹线宽度 */
  lineWidth?: number;
  /** 轨迹点颜色 */
  pointColor?: string;
  /** 轨迹点半径 */
  pointRadius?: number;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 播放速度（毫秒/点） */
  playSpeed?: number;
}

/**
 * useBaseMap composable 选项
 */
export interface UseBaseMapOptions {
  /** 地图容器元素的 ref */
  container: Readonly<Ref<HTMLElement | null | undefined>>;
  /** 样式 URL */
  styleUrl?: string;
  /** 中心点 */
  center?: [number, number];
  /** 缩放级别 */
  zoom?: number;
  /** 最小缩放 */
  minZoom?: number;
  /** 最大缩放 */
  maxZoom?: number;
}

/**
 * useBaseMap composable 返回值
 */
export interface UseBaseMapReturn {
  /** MapLibre Map 实例 */
  map: Readonly<ShallowRef<maplibregl.Map | null>>;
  /** 加载状态 */
  loading: Readonly<Ref<boolean>>;
  /** 手动触发 resize */
  resize: () => void;
}

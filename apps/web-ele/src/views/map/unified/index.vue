<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';

import { onMounted, reactive, ref } from 'vue';

import { ColPage } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { MapUnified } from '@vben-core/map-ui';

import { ElButton, ElTooltip } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

defineOptions({ name: 'MapMarkingPage' });

// ============ 类型定义 ============
interface MapPoint {
  action: string;
  lat: number;
  lng: number;
  timestamp: number;
}

// ============ 数据源 ============
function generateSampleData(): MapPoint[] {
  const baseTime = Date.now() - 7200 * 1000;
  const centerLng = 120.3119;
  const centerLat = 31.4912;
  const actions = ['停留', '移动', '拍照', '打卡', '休息'];
  const points: MapPoint[] = [];

  const trajectoryPoints = [
    [0, 0],
    [-0.008, 0.005],
    [-0.012, 0.012],
    [-0.01, 0.02],
    [-0.005, 0.025],
    [0.005, 0.022],
    [0.012, 0.018],
    [0.018, 0.012],
    [0.02, 0.005],
    [0.018, -0.005],
    [0.012, -0.012],
    [0.005, -0.018],
    [-0.005, -0.02],
    [-0.012, -0.015],
    [-0.008, -0.008],
  ];

  for (const [i, trajectoryPoint] of trajectoryPoints.entries()) {
    const [offsetLng = 0, offsetLat = 0] = trajectoryPoint ?? [0, 0];
    points.push({
      lng: centerLng + offsetLng,
      lat: centerLat + offsetLat,
      timestamp: baseTime + i * 300_000,
      action:
        i === 0 || i === 5 || i === 10
          ? '打卡'
          : (Math.random() > 0.7
            ? '拍照'
            : '移动'),
    });
  }

  const hotSpot1 = { lng: centerLng - 0.005, lat: centerLat + 0.008 };
  for (let i = 0; i < 20; i++) {
    points.push({
      lng: hotSpot1.lng + (Math.random() - 0.5) * 0.006,
      lat: hotSpot1.lat + (Math.random() - 0.5) * 0.006,
      timestamp: baseTime + Math.random() * 7_200_000,
      action: actions[Math.floor(Math.random() * actions.length)] ?? '移动',
    });
  }

  const hotSpot2 = { lng: centerLng + 0.012, lat: centerLat - 0.003 };
  for (let i = 0; i < 15; i++) {
    points.push({
      lng: hotSpot2.lng + (Math.random() - 0.5) * 0.005,
      lat: hotSpot2.lat + (Math.random() - 0.5) * 0.005,
      timestamp: baseTime + Math.random() * 7_200_000,
      action: actions[Math.floor(Math.random() * actions.length)] ?? '移动',
    });
  }

  const hotSpot3 = { lng: centerLng + 0.003, lat: centerLat + 0.015 };
  for (let i = 0; i < 12; i++) {
    points.push({
      lng: hotSpot3.lng + (Math.random() - 0.5) * 0.004,
      lat: hotSpot3.lat + (Math.random() - 0.5) * 0.004,
      timestamp: baseTime + Math.random() * 7_200_000,
      action: actions[Math.floor(Math.random() * actions.length)] ?? '移动',
    });
  }

  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.01 + Math.random() * 0.015;
    points.push({
      lng: centerLng + Math.cos(angle) * radius,
      lat: centerLat + Math.sin(angle) * radius,
      timestamp: baseTime + Math.random() * 7_200_000,
      action: actions[Math.floor(Math.random() * actions.length)] ?? '移动',
    });
  }

  return points.toSorted((a, b) => a.timestamp - b.timestamp);
}

const allDataPoints = ref<MapPoint[]>(generateSampleData());
const filteredPoints = ref<MapPoint[]>([...allDataPoints.value]);

// ============ 搜索表单 Schema ============
const formSchema: VbenFormSchema[] = [
  {
    component: 'Select',
    componentProps: {
      clearable: true,
      options: [
        { label: '停留', value: '停留' },
        { label: '移动', value: '移动' },
        { label: '拍照', value: '拍照' },
        { label: '打卡', value: '打卡' },
        { label: '休息', value: '休息' },
      ],
      placeholder: '请选择动作类型',
    },
    fieldName: 'action',
    label: '动作类型',
  },
  {
    component: 'DatePicker',
    componentProps: {
      clearable: true,
      placeholder: '选择时间范围',
      type: 'datetimerange',
    },
    fieldName: 'timeRange',
    label: '时间范围',
  },
];

// ============ 表格 ============
const [Grid] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { type: 'seq', width: 50, title: '序号' },
      { field: 'lng', title: '经度', width: 120 },
      { field: 'lat', title: '纬度', width: 120 },
      { field: 'action', title: '动作类型', width: 100 },
      {
        field: 'timestamp',
        formatter: 'formatDateTime',
        minWidth: 180,
        title: '时间',
      },
    ],
    pagerConfig: {},
    proxyConfig: {
      ajax: {
        query: async (
          { page }: { page: { currentPage: number; pageSize: number } },
          formValues: Record<string, any>,
        ) => {
          let result = [...allDataPoints.value];

          if (formValues?.action) {
            result = result.filter((p) => p.action === formValues.action);
          }

          if (formValues?.timeRange && formValues.timeRange.length === 2) {
            const [start, end] = formValues.timeRange;
            result = result.filter(
              (p) =>
                p.timestamp >= new Date(start).getTime() &&
                p.timestamp <= new Date(end).getTime(),
            );
          }

          if (formValues?.keyword) {
            const kw = formValues.keyword.toLowerCase();
            result = result.filter(
              (p) => String(p.lng).includes(kw) || String(p.lat).includes(kw),
            );
          }

          filteredPoints.value = result;

          const total = result.length;
          const startIndex = (page.currentPage - 1) * page.pageSize;
          const endIndex = startIndex + page.pageSize;
          const items = result.slice(startIndex, endIndex);

          return { items, total };
        },
      },
    },
  },
  formOptions: {
    schema: formSchema,
    submitOnChange: true,
    submitOnEnter: true,
    collapsed: false,
    showCollapseButton: false,
    submitButtonOptions: {
      content: '过滤',
    },
  },
  tableTitle: '标记点数据',
});

// ============ 地图 ============
const mapRef = ref<InstanceType<typeof MapUnified>>();

function handlePointClick(_data: MapPoint & { index: number }) {
  // TODO: 处理地图标记点点击事件
}

// 首次加载后自动进入撒点模式
onMounted(() => {
  // 延迟确保地图初始化完成
  setTimeout(() => {
    mapRef.value?.enableScatterMode();
  }, 500);
});

const props = reactive({
  leftCollapsedWidth: 5,
  leftCollapsible: true,
  leftMaxWidth: 60,
  leftMinWidth: 20,
  leftWidth: 50,
  resizable: true,
  rightWidth: 50,
  splitHandle: true,
  splitLine: true,
});
</script>

<template>
  <ColPage
    auto-content-height
    v-bind="props"
  >
    <template #left="{ isCollapsed, expand }">
      <div v-if="isCollapsed" @click="expand">
        <ElTooltip content="点击展开地图">
          <ElButton circle type="primary" class="flex-center">
            <IconifyIcon class="text-2xl" icon="bi:arrow-right" />
          </ElButton>
        </ElTooltip>
      </div>
      <MapUnified
        ref="mapRef"
        :center="[120.3119, 31.4912]"
        :zoom="13"
        :points="filteredPoints"
        @point-click="handlePointClick"
        v-else
      />
    </template>
    <Grid />
  </ColPage>
</template>

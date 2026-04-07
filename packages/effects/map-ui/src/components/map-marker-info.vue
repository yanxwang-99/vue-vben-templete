<script lang="ts" setup>
import { computed } from 'vue';

import { Pin, X } from '@vben/icons';

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  VbenIconButton,
} from '@vben-core/shadcn-ui';

// ============ 类型定义 ============
interface InfoField {
  label: string;
  value: number | string;
  tag?: boolean;
  tagType?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
}

defineOptions({ name: 'MapMarkerInfo' });

// ============ Props & Emits ============
const props = withDefaults(
  defineProps<{
    fields?: InfoField[];
    lat?: number;
    lng?: number;
    subtitle?: string;
    title?: string;
    visible: boolean;
  }>(),
  {
    title: '',
    subtitle: '',
    fields: () => [],
    lat: undefined,
    lng: undefined,
  },
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// ============ 计算属性 ============
const formattedLng = computed(() =>
  props.lng == null ? '-' : props.lng.toFixed(6),
);

const formattedLat = computed(() =>
  props.lat == null ? '-' : props.lat.toFixed(6),
);

// ============ 方法 ============
function handleClose() {
  emit('close');
}

function getBadgeVariant(
  type?: string,
): 'default' | 'destructive' | 'outline' | 'secondary' {
  const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    danger: 'destructive',
    info: 'secondary',
    primary: 'default',
    success: 'secondary',
    warning: 'outline',
  };
  return variants[type || 'primary'] || 'default';
}

function getBadgeClass(type?: string): string {
  const classes: Record<string, string> = {
    danger: 'bg-red-500 text-white dark:bg-red-600 dark:text-white',
    info: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    primary: 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white',
    success: 'bg-green-500 text-white dark:bg-green-600 dark:text-white',
    warning: 'border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-400',
  };
  return classes[type || ''] || '';
}
</script>

<template>
  <Transition name="slide-fade">
    <div v-if="visible" class="absolute right-4 top-4 z-20 w-80">
      <Card class="overflow-hidden">
        <!-- 头部 -->
        <CardHeader class="flex flex-row items-start justify-between space-y-0 pb-3">
          <div class="flex-1">
            <CardTitle v-if="title" class="text-base">
              {{ title }}
            </CardTitle>
            <p v-if="subtitle" class="mt-0.5 text-xs text-muted-foreground">
              {{ subtitle }}
            </p>
          </div>
          <VbenIconButton tooltip="关闭" @click="handleClose">
            <X class="h-4 w-4" />
          </VbenIconButton>
        </CardHeader>

        <Separator />

        <!-- 坐标信息 -->
        <CardContent class="flex items-center gap-3 py-3">
          <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <Pin class="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <div class="text-xs text-muted-foreground">坐标位置</div>
            <div class="mt-0.5 font-mono text-sm">
              {{ formattedLng }}, {{ formattedLat }}
            </div>
          </div>
        </CardContent>

        <!-- 自定义字段 -->
        <template v-if="fields.length > 0">
          <Separator />
          <CardContent class="pb-4 pt-3">
            <div class="space-y-2">
              <div
                v-for="(field, index) in fields"
                :key="index"
                class="flex items-start justify-between gap-2"
              >
                <span class="flex-shrink-0 text-xs text-muted-foreground">
                  {{ field.label }}
                </span>
                <Badge
                  v-if="field.tag"
                  :variant="getBadgeVariant(field.tagType)"
                  :class="getBadgeClass(field.tagType)"
                >
                  {{ field.value }}
                </Badge>
                <span v-else class="text-right text-xs">
                  {{ field.value }}
                </span>
              </div>
            </div>
          </CardContent>
        </template>

        <!-- 底部插槽 -->
        <template v-if="$slots.footer">
          <Separator />
          <CardContent class="py-3">
            <slot name="footer"></slot>
          </CardContent>
        </template>
      </Card>
    </div>
  </Transition>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>

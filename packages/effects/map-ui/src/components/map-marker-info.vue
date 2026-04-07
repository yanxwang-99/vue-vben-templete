<script lang="ts" setup>
import { computed } from 'vue';


defineOptions({ name: 'MapMarkerInfo' });

// ============ Props ============
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
  },
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// ============ 类型定义 ============
interface InfoField {
  label: string;
  value: number | string;
  tag?: boolean;
  tagType?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
}

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

function getTagClass(type?: string): string {
  const classes: Record<string, string> = {
    danger: 'bg-red-100 text-red-700',
    info: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
  };
  return classes[type || 'primary'] || classes.primary;
}
</script>

<template>
  <Transition name="slide-fade">
    <div
      v-if="visible"
      class="absolute right-4 top-4 z-20 w-80"
    >
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        <!-- 头部 -->
        <div class="flex items-center justify-between px-4 pt-4 pb-2">
          <div class="min-w-0 flex-1">
            <h3
              v-if="title"
              class="m-0 truncate text-base font-semibold text-gray-800"
            >
              {{ title }}
            </h3>
            <p
              v-if="subtitle"
              class="m-0 mt-0.5 truncate text-xs text-gray-400"
            >
              {{ subtitle }}
            </p>
          </div>
          <button
            class="ml-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            @click="handleClose"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <!-- 分隔线 -->
        <div class="border-t border-gray-100"></div>

        <!-- 坐标信息 -->
        <div class="flex items-center gap-3 px-4 py-3">
          <div
            class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3B82F6"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs text-gray-400">坐标位置</div>
            <div class="mt-0.5 font-mono text-sm text-gray-700">
              {{ formattedLng }}, {{ formattedLat }}
            </div>
          </div>
        </div>

        <!-- 自定义字段 -->
        <div v-if="fields.length > 0" class="border-t border-gray-100 px-4 pb-4 pt-3">
          <div class="space-y-2">
            <div
              v-for="(field, index) in fields"
              :key="index"
              class="flex items-start justify-between gap-2"
            >
              <span class="flex-shrink-0 text-xs text-gray-500">
                {{ field.label }}
              </span>
              <span
                v-if="field.tag"
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                :class="getTagClass(field.tagType)"
              >
                {{ field.value }}
              </span>
              <span
                v-else
                class="text-right text-xs text-gray-700"
              >
                {{ field.value }}
              </span>
            </div>
          </div>
        </div>

        <!-- 底部插槽 -->
        <div v-if="$slots.footer" class="border-t border-gray-100 px-4 py-3">
          <slot name="footer"></slot>
        </div>
      </div>
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

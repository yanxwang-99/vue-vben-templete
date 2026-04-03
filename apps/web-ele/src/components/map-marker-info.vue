<script lang="ts" setup>
import { computed } from 'vue';
import {
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElDivider,
  ElTag,
} from 'element-plus';

defineOptions({ name: 'MapMarkerInfo' });

interface InfoField {
  label: string;
  value: string | number;
  tag?: boolean;
  tagType?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const props = withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    subtitle?: string;
    fields?: InfoField[];
    lng?: number;
    lat?: number;
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

const formattedLng = computed(() =>
  props.lng != null ? props.lng.toFixed(6) : '-',
);
const formattedLat = computed(() =>
  props.lat != null ? props.lat.toFixed(6) : '-',
);

function handleClose() {
  emit('close');
}
</script>

<template>
  <Transition name="slide-fade">
    <div
      v-if="visible"
      class="absolute right-4 top-4 z-20 w-80"
    >
      <ElCard
        shadow="always"
        class="rounded-xl border-0"
        :body-style="{ padding: 0 }"
      >
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

        <ElDivider class="!my-0" />

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
        <div v-if="fields.length > 0" class="px-4 pb-4">
          <ElDescriptions :column="1" border size="small">
            <ElDescriptionsItem
              v-for="(field, index) in fields"
              :key="index"
              :label="field.label"
            >
              <ElTag
                v-if="field.tag"
                :type="field.tagType ?? 'primary'"
                size="small"
                effect="light"
                round
              >
                {{ field.value }}
              </ElTag>
              <span v-else class="text-sm text-gray-700">{{ field.value }}</span>
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <!-- 底部插槽 -->
        <div v-if="$slots.footer" class="border-t border-gray-100 px-4 py-3">
          <slot name="footer" />
        </div>
      </ElCard>
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
  transform: translateX(20px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}
</style>

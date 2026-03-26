<script lang="ts" setup>
import { useRouter } from 'vue-router';

import { VbenButton } from '@vben/common-ui';
import { $t } from '@vben/locales';

defineOptions({ name: 'ForgetPassword' });

const router = useRouter();

function goToLogin() {
  router.push('/auth/login');
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-medium">
      {{ $t('authentication.forgetPassword') }} 🤦🏻‍♂️
    </h1>

    <p class="mt-6 text-center text-base text-foreground">请联系数据室重置。</p>

    <VbenButton class="mt-6 w-full" variant="outline" @click="goToLogin()">
      {{ $t('common.back') }}
    </VbenButton>
  </div>
</template>

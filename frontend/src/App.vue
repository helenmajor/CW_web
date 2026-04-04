<template>
  <div id="app">
    <router-view />
    <HealingSandbox v-if="sandboxVisible" @close="sandboxVisible = false" />
    <PrizeShop v-if="shopVisible" @close="shopVisible = false" />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue';
import HealingSandbox from './components/HealingSandbox.vue';
import PrizeShop from './components/PrizeShop.vue';

const sandboxVisible = ref(false);
const shopVisible = ref(false);

const openSandbox = () => { sandboxVisible.value = true; };
const openShop = () => { shopVisible.value = true; };

provide('openSandbox', openSandbox);
provide('openShop', openShop);
</script>
<template>
  <CryptoBlockVisualizer
    mode="encrypt"
    :plaintext="plaintext"
    :ciphertext="ciphertext"
    :iv="iv"
    :is-failed="false"
    @complete="$emit('complete')"
  />
</template>

<script setup>
import CryptoBlockVisualizer from './CryptoBlockVisualizer.vue';

defineProps({
  plaintext: {
    type: String,
    required: true,
  },
  ciphertext: {
    type: String,
    required: true,
  },
  iv: {
    type: String,
    default: '',
  },
});

defineEmits(['complete']);
</script>

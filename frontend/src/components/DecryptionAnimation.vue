<template>
  <CryptoBlockVisualizer
    mode="decrypt"
    :ciphertext="ciphertext"
    :plaintext="plaintext"
    :iv="iv"
    :is-failed="isFailed"
    @complete="$emit('complete')"
  />
</template>

<script setup>
import CryptoBlockVisualizer from './CryptoBlockVisualizer.vue';

defineProps({
  ciphertext: {
    type: String,
    required: true,
  },
  plaintext: {
    type: String,
    required: true,
  },
  iv: {
    type: String,
    default: '',
  },
  isFailed: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['complete']);
</script>

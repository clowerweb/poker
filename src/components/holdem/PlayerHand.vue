<script setup>
import { defineProps } from 'vue'
import Card from '../Card.vue'

const props = defineProps({
  cards: {
    type: Array,
    default: () => []
  },
  folded: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="player-hand">
    <div 
      v-for="(card, index) in cards" 
      :key="card.id" 
      class="card-wrapper"
      :class="{ 'folded': folded }"
      :style="{ 
        left: `${index * 25}px`, 
        zIndex: index 
      }"
    >
      <Card 
        :card="card" 
        :faceUp="card.faceUp" 
        size="small"
      />
    </div>
  </div>
</template>

<style scoped>
.player-hand {
  position: relative;
  height: 80px;
  width: 80px;
}

.card-wrapper {
  position: absolute;
  transition: all 0.3s ease;
  transform-origin: center bottom;
}

.card-wrapper.folded {
  filter: grayscale(1) brightness(0.7);
  transform: rotate(90deg);
}
</style>

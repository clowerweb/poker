<script setup>
import { defineProps } from 'vue'
import Card from '../Card.vue'

const props = defineProps({
  cards: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="community-cards">
    <div 
      v-for="(card, index) in cards" 
      :key="card.id" 
      class="card-wrapper"
      :style="{ 
        left: `${index * 60 - ((cards.length - 1) * 30)}px`, 
        zIndex: index 
      }"
    >
      <Card 
        :card="card" 
        :faceUp="card.faceUp" 
        size="medium"
      />
    </div>
  </div>
</template>

<style scoped>
.community-cards {
  position: relative;
  height: 100px;
  width: 300px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}

.card-wrapper {
  position: absolute;
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: center bottom;
  filter: drop-shadow(0 5px 3px rgba(0, 0, 0, 0.4));
}
</style>

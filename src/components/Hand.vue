<script setup>
import Card from './Card.vue'

const props = defineProps({
  cards: {
    type: Array,
    required: true
  },
  heldCards: {
    type: Array,
    default: () => []
  },
  selectable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-hold'])

const handleCardClick = (index) => {
  if (props.selectable) {
    emit('toggle-hold', index)
  }
}
</script>

<template>
  <div class="flex flex-wrap gap-2 justify-center">
    <div 
      v-for="(card, index) in cards" 
      :key="card.id" 
      class="relative transition-transform duration-300"
      :style="{ 
        animationDelay: `${index * 100}ms`,
      }"
      @click="handleCardClick(index)"
    >
      <Card 
        :card="card" 
        :is-held="heldCards.includes(index)"
      />
      <div 
        v-if="selectable" 
        class="absolute -top-2 -right-2 w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-colors"
        :class="heldCards.includes(index) ? 
          'bg-yellow-500 text-white border-yellow-600' : 
          'bg-slate-100 border-slate-300 hover:bg-yellow-500 hover:text-white'"
      >
        <span class="text-xs font-bold">{{ heldCards.includes(index) ? 'H' : '+' }}</span>
      </div>
    </div>
  </div>
</template>

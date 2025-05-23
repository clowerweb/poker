<script setup>
defineProps({
  card: {
    type: Object,
    required: true
  },
  isHeld: {
    type: Boolean,
    default: false
  },
  faceUp: {
    type: Boolean,
    default: true 
  },
  size: {
    type: String,
    default: 'large', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const getSuitColor = (suit) => {
  return ['hearts', 'diamonds'].includes(suit) ? 'text-red-500' : 'text-slate-900'
}

const getSuitSymbol = (suit) => {
  switch (suit) {
    case 'hearts': return '♥'
    case 'diamonds': return '♦'
    case 'clubs': return '♣'
    case 'spades': return '♠'
    default: return ''
  }
}
</script>

<template>
  <div
    class="card relative rounded-lg shadow-md flex flex-col justify-between p-2 bg-white border border-gray-200 transition-all duration-300 hover:scale-105"
    :class="{ 
      'bg-blue-800 border-blue-900': !faceUp,
      'card-held': isHeld,
      'animate-card-deal': faceUp,
      'h-32 w-24': size === 'large',
      'h-24 w-18': size === 'medium',
      'h-20 w-14': size === 'small'
    }"
  >
    <template v-if="faceUp">
      <div class="flex justify-between items-center">
        <div :class="[getSuitColor(card.suit), size === 'small' ? 'text-sm' : 'text-lg', 'font-bold']">{{ card.value }}</div>
        <div :class="[getSuitColor(card.suit), size === 'small' ? 'text-sm' : 'text-lg']">{{ getSuitSymbol(card.suit) }}</div>
      </div>
      
      <div :class="[getSuitColor(card.suit), size === 'small' ? 'text-xl' : size === 'medium' ? 'text-2xl' : 'text-3xl', 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2']">
        {{ getSuitSymbol(card.suit) }}
      </div>
      
      <div class="flex justify-between items-center self-end">
        <div :class="[getSuitColor(card.suit), size === 'small' ? 'text-sm' : 'text-lg']">{{ getSuitSymbol(card.suit) }}</div>
        <div :class="[getSuitColor(card.suit), size === 'small' ? 'text-sm' : 'text-lg', 'font-bold']">{{ card.value }}</div>
      </div>
      
      <!-- HOLD text overlay -->
      <div 
        v-if="isHeld" 
        class="absolute inset-0 flex items-center justify-center bg-yellow-500/30 rounded-lg border-2 border-yellow-500"
      >
        <div class="bg-yellow-500 px-2 py-1 rounded text-white font-bold transform rotate-12 shadow-lg animate-pulse">
          HOLD
        </div>
      </div>
    </template>
    
    <div v-else class="card-back w-full h-full flex items-center justify-center">
      <div :class="[size === 'small' ? 'text-sm' : 'text-xl', 'text-white font-bold']">🃏</div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.card {
  perspective: 1000px;
  transform-style: preserve-3d;
}

.card-held {
  transform: translateY(-20px);
}

.w-18 {
  width: 4.5rem;
}

.w-14 {
  width: 3.5rem;
}

@keyframes cardDeal {
  0% {
    opacity: 0;
    transform: translateY(-50px) rotate(-5deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0);
  }
}

.animate-card-deal {
  animation: cardDeal 0.5s ease-out;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

<script setup>
import { defineProps } from 'vue'
import PlayerHand from './PlayerHand.vue'

const props = defineProps({
  player: {
    type: Object,
    required: true
  },
  isCurrent: {
    type: Boolean,
    default: false
  },
  isDealer: {
    type: Boolean,
    default: false
  },
  isSmallBlind: {
    type: Boolean,
    default: false
  },
  isBigBlind: {
    type: Boolean,
    default: false
  },
  position: {
    type: String,
    default: 'bottom' // bottom, top, left, right
  }
})
</script>

<template>
  <div 
    class="player-container relative" 
    :class="[
      position,
      { 'active-player': isCurrent, 'human-player': player.isPlayer }
    ]"
  >
    <!-- Player info section -->
    <div 
      class="bg-blue-900/70 p-3 rounded-lg shadow-lg w-40 text-center transform transition-all"
      :class="{ 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-blue-900': isCurrent }"
    >
      <div class="flex justify-center items-center gap-1">
        <div class="font-bold">{{ player.name }}</div>
        <!-- Position indicators -->
        <div v-if="isDealer" class="bg-white text-black text-xs rounded-full px-1 h-5 w-5 flex items-center justify-center">D</div>
        <div v-if="isSmallBlind" class="bg-yellow-400 text-black text-xs rounded-full px-1 h-5 w-5 flex items-center justify-center">SB</div>
        <div v-if="isBigBlind" class="bg-orange-500 text-black text-xs rounded-full px-1 h-5 w-5 flex items-center justify-center">BB</div>
      </div>
      
      <div class="text-yellow-300 font-bold">${{ player.chips }}</div>
      
      <!-- Current bet display -->
      <div v-if="player.currentBet > 0" class="mt-1 bg-blue-800 rounded py-1 px-2 text-sm">
        Bet: ${{ player.currentBet }}
      </div>
      
      <!-- Folded indicator -->
      <div v-if="player.folded" class="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
        <span class="font-bold text-red-500">FOLDED</span>
      </div>
      
      <!-- All-in indicator -->
      <div v-if="player.allIn" class="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-sm font-bold px-2 py-0.5 rounded-full">
        ALL IN
      </div>
    </div>
    
    <!-- Hand cards -->
    <div :class="['cards-container', position]">
      <PlayerHand :cards="player.holeCards" :folded="player.folded" />
    </div>
  </div>
</template>

<style scoped>
.player-container {
  z-index: 10;
}

.player-container.active-player {
  z-index: 20;
}

.cards-container {
  position: absolute;
  width: 95px;
}

.cards-container.bottom {
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
}

.cards-container.top {
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
}

.cards-container.left {
  right: -90px;
  top: 50%;
  transform: translateY(-50%);
}

.cards-container.right {
  left: -90px;
  top: 50%;
  transform: translateY(-50%);
}
</style>

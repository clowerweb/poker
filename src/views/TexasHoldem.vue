<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useTexasHoldemStore } from '../stores/texasHoldemStore'
import { useRouter } from 'vue-router'
import PlayerHand from '../components/holdem/PlayerHand.vue'
import CommunityCards from '../components/holdem/CommunityCards.vue'
import Player from '../components/holdem/Player.vue'

const router = useRouter()
const store = useTexasHoldemStore()
const raiseAmount = ref(store.minRaiseAmount())
const showRaiseSlider = ref(false)
const showRefillModal = ref(false)
const refillAmount = ref(1000)

const goToHome = () => {
  router.push('/')
}

const startGame = () => {
  store.startGame()
}

const check = () => {
  if (store.canCheck()) {
    store.check()
  }
}

const call = () => {
  if (store.canCall()) {
    store.call()
  }
}

const fold = () => {
  store.fold()
}

const toggleRaiseSlider = () => {
  showRaiseSlider.value = !showRaiseSlider.value
  if (showRaiseSlider.value) {
    raiseAmount.value = store.minRaiseAmount()
  }
}

const raise = () => {
  if (raiseAmount.value >= store.minRaiseAmount() && raiseAmount.value <= store.maxRaiseAmount()) {
    store.raise(raiseAmount.value)
    showRaiseSlider.value = false
  }
}

const addChips = () => {
  store.addChips(refillAmount.value)
  showRefillModal.value = false
}

// Watch for player's chips hitting zero
watch(() => store.humanPlayer.chips, (newChips) => {
  if (newChips <= 0 && store.gamePhase === 'idle') {
    showRefillModal.value = true
  }
})

onMounted(() => {
  store.initGame()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-900 to-green-900 text-white">
    <header class="bg-blue-950 p-4 shadow-lg flex justify-between items-center">
      <button 
        @click="goToHome" 
        class="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <span class="mr-1">←</span> Back to Games
      </button>
      <h1 class="text-3xl font-bold text-center">Texas Hold'em</h1>
      <div class="w-32"></div> <!-- Spacer to center the title -->
    </header>

    <main class="container mx-auto p-4 flex flex-col items-center">
      <!-- Refill Modal -->
      <div v-if="showRefillModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div class="bg-blue-900 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 class="text-xl font-bold mb-4 text-center">Out of Chips!</h2>
          <p class="mb-4">You're out of chips. Would you like to buy in again?</p>
          
          <div class="flex items-center gap-4 mb-4">
            <label>Amount:</label>
            <input 
              v-model="refillAmount" 
              type="range" 
              min="500" 
              max="5000"
              step="100" 
              class="w-full"
            />
            <span class="text-yellow-400">${{ refillAmount }}</span>
          </div>
          
          <div class="flex justify-between">
            <button 
              @click="showRefillModal = false"
              class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-all"
            >
              No Thanks
            </button>
            <button 
              @click="addChips"
              class="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded transition-all"
            >
              Add Chips
            </button>
          </div>
        </div>
      </div>

      <!-- Poker Table -->
      <div class="relative w-full max-w-4xl h-[600px] bg-green-800 border-8 border-brown-900 rounded-[50%] mt-4 mb-8 shadow-2xl overflow-hidden">
        <!-- Center pot and community cards -->
        <div class="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center z-10">
          <div class="text-yellow-300 text-xl font-bold mb-2">Pot: ${{ store.pot }}</div>
          <CommunityCards :cards="store.communityCards" />
        </div>
        
        <!-- Players around the table -->
        <div class="absolute inset-0">
          <!-- Player positions - human at bottom, AI clockwise -->
          <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Player 
              :player="store.humanPlayer" 
              :is-current="store.isPlayerTurn"
              :is-dealer="store.dealerIndex === 0"
              :is-small-blind="store.smallBlindIndex === 0"
              :is-big-blind="store.bigBlindIndex === 0"
              position="bottom"
            />
          </div>
          
          <div class="absolute right-4 bottom-1/4">
            <Player 
              :player="store.players[1]" 
              :is-current="store.currentPlayerIndex === 1"
              :is-dealer="store.dealerIndex === 1"
              :is-small-blind="store.smallBlindIndex === 1"
              :is-big-blind="store.bigBlindIndex === 1"
              position="right"
            />
          </div>
          
          <div class="absolute top-4 left-1/2 transform -translate-x-1/2">
            <Player 
              :player="store.players[2]" 
              :is-current="store.currentPlayerIndex === 2"
              :is-dealer="store.dealerIndex === 2"
              :is-small-blind="store.smallBlindIndex === 2"
              :is-big-blind="store.bigBlindIndex === 2"
              position="top"
            />
          </div>
          
          <div class="absolute left-4 bottom-1/4">
            <Player 
              :player="store.players[3]" 
              :is-current="store.currentPlayerIndex === 3"
              :is-dealer="store.dealerIndex === 3"
              :is-small-blind="store.smallBlindIndex === 3"
              :is-big-blind="store.bigBlindIndex === 3"
              position="left"
            />
          </div>
        </div>
        
        <!-- Table felt pattern overlay -->
        <div class="absolute inset-0 bg-gradient-radial from-green-700/0 to-green-900/40 pointer-events-none"></div>
      </div>
      
      <!-- Game Information -->
      <div class="bg-blue-900/70 p-4 rounded-lg shadow-lg w-full max-w-4xl mb-4">
        <div class="flex justify-between items-center">
          <div class="text-lg">
            <p>Game: <span class="font-bold">{{ store.gamePhase === 'idle' ? 'Not Started' : store.gamePhase }}</span></p>
            <p>Your Chips: <span class="font-bold text-yellow-300">${{ store.humanPlayer?.chips || 0 }}</span></p>
          </div>
          <div class="text-lg">
            <p class="font-bold text-center">{{ store.gameMessage }}</p>
            <p class="text-sm text-blue-300 text-center" v-if="store.lastAction">{{ store.lastAction }}</p>
          </div>
          <div class="text-lg">
            <p>Current Bet: <span class="font-bold">${{ store.currentBet }}</span></p>
            <p v-if="store.isPlayerTurn">Your Turn!</p>
          </div>
        </div>
      </div>
      
      <!-- Player Controls -->
      <div class="bg-blue-900/70 p-4 rounded-lg shadow-lg w-full max-w-4xl mb-4 h-32 flex items-center justify-center">
        <!-- Game start controls -->
        <div v-if="store.gamePhase === 'idle' && !store.winner" class="text-center">
          <button 
            @click="startGame"
            class="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105"
          >
            Start New Hand
          </button>
        </div>
        
        <!-- Game result and restart -->
        <div v-else-if="store.gamePhase === 'idle' && store.winner" class="text-center">
          <div class="text-2xl font-bold mb-3 text-yellow-300">
            {{ store.winner.name }} wins the pot!
          </div>
          <button 
            @click="startGame"
            class="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105"
          >
            Play Again
          </button>
        </div>
        
        <!-- Player action controls -->
        <div v-else-if="store.isPlayerTurn" class="flex gap-4">
          <button 
            @click="fold"
            class="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow transition-all hover:scale-105"
          >
            Fold
          </button>
          
          <button 
            @click="check"
            :disabled="!store.canCheck()"
            :class="[
              'font-bold py-2 px-6 rounded-full shadow transition-all hover:scale-105',
              store.canCheck() 
                ? 'bg-green-600 hover:bg-green-500 text-white' 
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            ]"
          >
            {{ store.canCheck() ? 'Check' : 'Check (N/A)' }}
          </button>
          
          <button 
            @click="call"
            :disabled="!store.canCall()"
            :class="[
              'font-bold py-2 px-6 rounded-full shadow transition-all hover:scale-105',
              store.canCall() 
                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            ]"
          >
            {{ store.canCall() ? `Call $${store.currentBet - store.humanPlayer.currentBet}` : 'Call (N/A)' }}
          </button>
          
          <div class="relative">
            <button 
              @click="toggleRaiseSlider"
              :disabled="store.humanPlayer.chips <= 0"
              :class="[
                'font-bold py-2 px-6 rounded-full shadow transition-all hover:scale-105',
                store.humanPlayer.chips > 0
                  ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              ]"
            >
              Raise
            </button>
            
            <!-- Raise slider popup -->
            <div v-if="showRaiseSlider" class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-blue-950 p-4 rounded-lg shadow-xl w-64">
              <div class="flex items-center gap-2 mb-2">
                <input 
                  v-model="raiseAmount" 
                  type="range" 
                  :min="store.minRaiseAmount()" 
                  :max="store.maxRaiseAmount()"
                  step="10" 
                  class="w-full"
                />
                <span class="text-yellow-400 whitespace-nowrap">${{ raiseAmount }}</span>
              </div>
              <div class="flex justify-between">
                <button 
                  @click="toggleRaiseSlider"
                  class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Cancel
                </button>
                <button 
                  @click="raise"
                  class="bg-purple-600 hover:bg-purple-500 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Confirm Raise
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Waiting for other players -->
        <div v-else class="text-center">
          <p class="text-xl">Waiting for other players to act...</p>
          <p class="text-blue-300">{{ store.gameMessage }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.bg-brown-900 {
  background-color: #5D4037;
  border-color: #5D4037;
}

.bg-gradient-radial {
  background-image: radial-gradient(var(--tw-gradient-stops));
}
</style>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useGameStore } from './stores/gameStore'
import Hand from './components/Hand.vue'

const gameStore = useGameStore()
const heldCards = ref([])
const betAmount = ref(5)
const availableBets = [1, 5, 10, 25, 50]
const showWinAnimation = ref(false)
const showInsufficientFundsMessage = ref(false)
const showCreditRefillModal = ref(false)

const handDescription = computed(() => {
  if (gameStore.winner) {
    return gameStore.winner
  }
  return 'Place your bet to start'
})

const insufficientFunds = computed(() => {
  return betAmount.value > gameStore.credits
})

// Also watch game phase changes to detect when a round ends with zero credits
watch(() => gameStore.gamePhase, (newPhase) => {
  if (newPhase === 'showdown' && gameStore.credits <= 0) {
    setTimeout(() => {
      showCreditRefillModal.value = true
    }, 1500)
  }
})

const toggleHold = (index) => {
  const cardIdx = heldCards.value.indexOf(index)
  if (cardIdx === -1) {
    heldCards.value.push(index)
  } else {
    heldCards.value.splice(cardIdx, 1)
  }
}

const dealCards = () => {
  if (insufficientFunds.value) {
    showInsufficientFundsMessage.value = true
    setTimeout(() => {
      showInsufficientFundsMessage.value = false
    }, 3000)
    return
  }

  gameStore.placeBet(betAmount.value)
}

const drawNewCards = () => {
  // Convert held cards to discard cards (all indices not in heldCards)
  const discardIndices = []
  for (let i = 0; i < gameStore.playerHand.length; i++) {
    if (!heldCards.value.includes(i)) {
      discardIndices.push(i)
    }
  }

  gameStore.discardCards(discardIndices)
  heldCards.value = []
}

const newGame = () => {
  gameStore.initGame()
  heldCards.value = []
}

const checkWinner = () => {
  gameStore.evaluateWinner()
  if (gameStore.winner && gameStore.winner !== 'High Card') {
    showWinAnimation.value = true
    setTimeout(() => {
      showWinAnimation.value = false
    }, 3000)
  }

  // Check if we ran out of credits after evaluation
  if (gameStore.credits <= 0) {
    setTimeout(() => {
      showCreditRefillModal.value = true
    }, 3500)
  }
}

const refillCredits = () => {
  gameStore.addCredits(100)
  showCreditRefillModal.value = false
}

onMounted(() => {
  gameStore.initGame()
})
</script>

<template>
  <div class="min-h-screen bg-green-800 text-white">
    <header class="bg-green-900 p-4 shadow-lg">
      <h1 class="text-3xl font-bold text-center">Video Poker</h1>
    </header>

    <main class="container mx-auto p-4">
      <!-- Win Animation -->
      <div
        v-if="showWinAnimation"
        class="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
      >
        <div class="relative">
          <div class="animate-winner-text text-6xl font-bold text-yellow-300 drop-shadow-lg">
            {{ gameStore.winner }}!
          </div>
          <div class="animate-confetti absolute -inset-20 opacity-75"></div>
        </div>
      </div>

      <!-- Credit Refill Modal -->
      <div v-if="showCreditRefillModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-green-900 p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 class="text-xl font-bold mb-4 text-center">Out of Credits!</h2>
          <p class="mb-4">You've run out of credits. Would you like to refill?</p>

          <div class="flex justify-between">
            <button
              @click="showCreditRefillModal = false"
              class="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-all"
            >
              Cancel
            </button>
            <button
              @click="refillCredits"
              class="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded transition-all"
            >
              Refill Credits
            </button>
          </div>
        </div>
      </div>

      <!-- Game information -->
      <div class="flex justify-between mb-6 bg-green-900/70 p-4 rounded-lg shadow-lg">
        <div class="text-xl">
          <div>Credits: <span class="font-bold" :class="{'animate-credits': gameStore.gamePhase === 'showdown' && gameStore.winner !== 'High Card'}">{{ gameStore.credits }}</span></div>
          <div>Current Bet: <span class="font-bold">{{ gameStore.currentBet }}</span></div>
        </div>
      </div>

      <!-- Player's hand -->
      <div class="mb-8">
        <Hand
          :cards="gameStore.playerHand"
          :held-cards="heldCards"
          :selectable="gameStore.gamePhase === 'player-turn'"
          @toggle-hold="toggleHold"
        />

        <!-- Fixed-height container for messages -->
        <div class="h-8 mt-4 flex justify-center items-center">
          <div v-if="heldCards.length > 0 && gameStore.gamePhase === 'player-turn'" class="text-center">
            <span class="bg-yellow-500 text-white px-3 py-1 rounded-full">{{ heldCards.length }} cards held</span>
          </div>

          <div v-if="showInsufficientFundsMessage" class="text-center">
            <span class="bg-red-500 text-white px-3 py-1 rounded-full animate-bounce">Insufficient credits for this bet!</span>
          </div>
        </div>
      </div>

      <!-- Game controls - fixed height container -->
      <div class="flex flex-col items-center h-24 justify-center">
        <!-- Betting controls (only shown in initial phase) -->
        <div v-if="gameStore.gamePhase === 'initial'" class="flex flex-col gap-4 items-center">
          <div class="flex gap-2">
            <span class="self-center">Bet Amount:</span>
            <select
              v-model="betAmount"
              class="bg-green-700 border border-green-600 rounded px-2 py-1"
              :class="{'border-red-500': insufficientFunds}"
            >
              <option v-for="bet in availableBets" :key="bet" :value="bet">{{ bet }}</option>
            </select>
          </div>

          <button
            @click="dealCards"
            class="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-full transition-colors transform hover:scale-105 active:scale-95"
            :class="{'opacity-50 cursor-not-allowed': insufficientFunds}"
          >
            Deal Cards
          </button>
        </div>

        <!-- Player turn controls -->
        <div v-if="gameStore.gamePhase === 'player-turn'" class="flex gap-4">
          <button
            @click="drawNewCards"
            class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-full transition-all transform hover:scale-105 active:scale-95"
          >
            Draw New Cards
          </button>

          <button
            @click="checkWinner"
            class="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-full transition-all transform hover:scale-105 active:scale-95"
          >
            Stand
          </button>
        </div>

        <!-- Showdown controls -->
        <div v-if="gameStore.gamePhase === 'showdown'" class="text-center">
          <div
            class="text-2xl mb-4 transition-all duration-500"
            :class="gameStore.winner !== 'High Card' ? 'text-yellow-300 animate-pulse-slow' : ''"
          >
            {{ gameStore.winner }}
          </div>

          <button
            @click="newGame"
            class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-full transition-all transform hover:scale-105 active:scale-95"
          >
            Play Again
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped lang="postcss">
button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

@keyframes pulseCredits {
  0%, 100% {
    @apply text-white;
    transform: scale(1);
  }
  50% {
    @apply text-yellow-300;
    transform: scale(1.2);
  }
}

.animate-credits {
  animation: pulseCredits 1s ease-in-out 3;
}

@keyframes pulseSlow {
  0%, 100% {
    opacity: 1;
    text-shadow: 0 0 15px rgba(255, 255, 0, 0.7);
  }
  50% {
    opacity: 0.8;
    text-shadow: 0 0 5px rgba(255, 255, 0, 0.3);
  }
}

.animate-pulse-slow {
  animation: pulseSlow 2s ease-in-out infinite;
}

@keyframes winnerText {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-winner-text {
  animation: winnerText 1s ease-out;
}

.animate-confetti {
  background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M35 85l5-5 5 5-5 5z' fill='%23FC6'/%3E%3Cpath d='M15 95l5-5 5 5-5 5z' fill='%23F6C'/%3E%3Cpath d='M55 75l5-5 5 5-5 5z' fill='%236CF'/%3E%3Cpath d='M75 95l5-5 5 5-5 5z' fill='%23F90'/%3E%3Cpath d='M95 75l5-5 5 5-5 5z' fill='%239F6'/%3E%3Cpath d='M115 95l5-5 5 5-5 5z' fill='%236FC'/%3E%3Cpath d='M135 75l5-5 5 5-5 5z' fill='%236CF'/%3E%3Cpath d='M155 95l5-5 5 5-5 5z' fill='%23FC6'/%3E%3Cpath d='M175 75l5-5 5 5-5 5z' fill='%23F6C'/%3E%3Cpath d='M35 55l5-5 5 5-5 5z' fill='%23F90'/%3E%3Cpath d='M15 65l5-5 5 5-5 5z' fill='%239F6'/%3E%3Cpath d='M55 45l5-5 5 5-5 5z' fill='%236FC'/%3E%3Cpath d='M75 65l5-5 5 5-5 5z' fill='%236CF'/%3E%3Cpath d='M95 45l5-5 5 5-5 5z' fill='%23FC6'/%3E%3Cpath d='M115 65l5-5 5 5-5 5z' fill='%23F6C'/%3E%3Cpath d='M135 45l5-5 5 5-5 5z' fill='%23F90'/%3E%3Cpath d='M155 65l5-5 5 5-5 5z' fill='%239F6'/%3E%3Cpath d='M175 45l5-5 5 5-5 5z' fill='%236FC'/%3E%3Cpath d='M35 125l5-5 5 5-5 5z' fill='%236CF'/%3E%3Cpath d='M15 135l5-5 5 5-5 5z' fill='%23FC6'/%3E%3Cpath d='M55 115l5-5 5 5-5 5z' fill='%23F6C'/%3E%3Cpath d='M75 135l5-5 5 5-5 5z' fill='%23F90'/%3E%3Cpath d='M95 115l5-5 5 5-5 5z' fill='%239F6'/%3E%3Cpath d='M115 135l5-5 5 5-5 5z' fill='%236FC'/%3E%3Cpath d='M135 115l5-5 5 5-5 5z' fill='%236CF'/%3E%3Cpath d='M155 135l5-5 5 5-5 5z' fill='%23FC6'/%3E%3Cpath d='M175 115l5-5 5 5-5 5z' fill='%23F6C'/%3E%3Cpath d='M35 155l5-5 5 5-5 5z' fill='%23F90'/%3E%3Cpath d='M15 165l5-5 5 5-5 5z' fill='%239F6'/%3E%3Cpath d='M55 145l5-5 5 5-5 5z' fill='%236FC'/%3E%3Cpath d='M75 165l5-5 5 5-5 5z' fill='%236CF'/%3E%3Cpath d='M95 145l5-5 5 5-5 5z' fill='%23FC6'/%3E%3Cpath d='M115 165l5-5 5 5-5 5z' fill='%23F6C'/%3E%3Cpath d='M135 145l5-5 5 5-5 5z' fill='%23F90'/%3E%3Cpath d='M155 165l5-5 5 5-5 5z' fill='%239F6'/%3E%3Cpath d='M175 145l5-5 5 5-5 5z' fill='%236FC'/%3E%3C/g%3E%3C/svg%3E");
  animation: confetti 1s linear infinite, fadeIn 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes confetti {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 100% 100%;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}
</style>

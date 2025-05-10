<script setup>
import { RouterView } from 'vue-router'
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
  <RouterView />
</template>

<style>
.animate-winner-text {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.animate-credits {
  animation: bounce 0.5s ease-in-out;
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
    color: white;
  }
  50% {
    transform: scale(1.2);
    color: gold;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-confetti {
  background-image: 
    radial-gradient(circle, #ff0 10%, transparent 10%),
    radial-gradient(circle, #f00 10%, transparent 10%),
    radial-gradient(circle, #0ff 10%, transparent 10%),
    radial-gradient(circle, #0f0 10%, transparent 10%),
    radial-gradient(circle, #00f 10%, transparent 10%),
    radial-gradient(circle, #f0f 10%, transparent 10%);
  background-size: 10% 10%, 20% 20%, 15% 15%, 18% 18%, 7% 7%, 12% 12%;
  animation: confetti 2.5s ease-in-out infinite;
}

@keyframes confetti {
  0% {
    background-position: 
      0% 0%, 
      5% 10%,
      10% 5%,
      20% 15%,
      15% 25%,
      30% 20%;
    transform: scale(1);
  }
  100% {
    background-position: 
      20% 20%,
      25% 30%,
      30% 25%,
      40% 35%,
      35% 45%,
      50% 40%;
    transform: scale(1.3);
  }
}
</style>

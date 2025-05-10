<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToGame = (route) => {
  router.push(route)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-900 to-green-900 text-white">
    <header class="bg-black/30 p-6 shadow-lg">
      <h1 class="text-4xl font-bold text-center">Card Games Collection</h1>
      <p class="text-center mt-2 text-gray-300">Choose your favorite card game to play</p>
    </header>

    <main class="container mx-auto p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <!-- Video Poker Card -->
        <div
          @click="navigateToGame('/video-poker')"
          class="bg-green-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
        >
          <div class="h-48 bg-[url('/cards-bg.jpg')] bg-cover bg-center relative">
            <div class="absolute inset-0 bg-green-900/70 flex items-center justify-center">
              <span class="text-3xl font-bold">Video Poker</span>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">Video Poker</h3>
            <p class="text-gray-300 mb-4">The classic casino game. Draw and hold cards to create the best poker hand.</p>
            <div class="flex justify-between items-center">
              <span class="bg-green-700 text-sm px-3 py-1 rounded-full">Single Player</span>
              <button class="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded transition-colors">
                Play Now
              </button>
            </div>
          </div>
        </div>

        <!-- Texas Hold'em Card -->
        <div
          @click="navigateToGame('/texas-holdem')"
          class="bg-green-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
        >
          <div class="h-48 bg-[url('/cards-bg.jpg')] bg-cover bg-center relative">
            <div class="absolute inset-0 bg-green-900/70 flex items-center justify-center">
              <span class="text-3xl font-bold">Texas Hold'em</span>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">Texas Hold'em</h3>
            <p class="text-gray-300 mb-4">The world's most popular poker variant. Community cards, betting rounds, and strategy.</p>
            <div class="flex justify-between items-center">
              <span class="bg-green-700 text-sm px-3 py-1 rounded-full">Single Player</span>
              <button class="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded transition-colors">
                Play Now
              </button>
            </div>
          </div>
        </div>

        <!-- Placeholder for future games -->
        <div class="bg-green-800/50 rounded-xl overflow-hidden shadow-lg border-2 border-dashed border-green-700">
          <div class="h-48 flex items-center justify-center">
            <span class="text-3xl font-bold text-green-600">More Games Coming Soon</span>
          </div>
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">Future Games</h3>
            <p class="text-gray-300 mb-4">We're constantly adding new card games to our collection. Check back soon!</p>
            <div class="flex justify-between items-center">
              <span class="bg-green-700 text-sm px-3 py-1 rounded-full">In Development</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="bg-black/30 p-4 mt-12">
      <div class="container mx-auto text-center text-gray-400">
        <p>
          <a href="https://github.com/clowerweb/poker" target="_blank">Github</a>
        </p>
      </div>
    </footer>
  </div>
</template>

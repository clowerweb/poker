<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-blue-900 text-white flex flex-col">
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

    <main class="flex-grow flex items-center justify-center">
      <div class="text-center max-w-xl p-8 bg-blue-950/50 rounded-xl shadow-2xl">
        <h2 class="text-4xl font-bold mb-6">Coming Soon!</h2>
        <div class="mb-8">
          <div class="inline-block p-2 rounded-full bg-yellow-500 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
          </div>
        </div>
        <p class="text-xl mb-4">We're working hard to bring you the ultimate Texas Hold'em experience!</p>
        <p class="text-gray-300 mb-8">Our team is developing an exciting multiplayer Texas Hold'em game with realistic gameplay and stunning visuals. Check back soon!</p>
        <button
          @click="goToHome"
          class="bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105"
        >
          Return to Homepage
        </button>
      </div>
    </main>

    <footer class="bg-blue-950 p-4">
      <div class="container mx-auto text-center text-gray-400">
        <a href="https://github.com/clowerweb/poker" target="_blank">Github</a>
      </div>
    </footer>
  </div>
</template>

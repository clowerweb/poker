import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/video-poker',
    name: 'videoPoker',
    component: () => import('../views/VideoPoker.vue')
  },
  // Will add Texas Hold'em later
  {
    path: '/texas-holdem',
    name: 'texasHoldem',
    component: () => import('../views/ComingSoon.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

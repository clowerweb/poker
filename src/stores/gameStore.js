import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    deck: [],
    playerHand: [],
    dealerHand: [],
    gamePhase: 'initial', // initial, deal, player-turn, dealer-turn, showdown
    credits: 100,
    currentBet: 0,
    winner: null,
  }),
  
  getters: {
    playerScore: (state) => evaluateHand(state.playerHand),
    dealerScore: (state) => evaluateHand(state.dealerHand),
  },
  
  actions: {
    initGame() {
      this.resetHands()
      this.createDeck()
      this.shuffleDeck()
      this.gamePhase = 'initial'
      this.currentBet = 0
      this.winner = null
    },
    
    createDeck() {
      const suits = ['hearts', 'diamonds', 'clubs', 'spades']
      const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
      
      this.deck = []
      
      for (const suit of suits) {
        for (const value of values) {
          this.deck.push({
            suit,
            value,
            faceUp: false,
            id: `${value}-${suit}`
          })
        }
      }
    },
    
    shuffleDeck() {
      for (let i = this.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]]
      }
    },
    
    resetHands() {
      this.playerHand = []
      this.dealerHand = []
    },
    
    dealInitialCards() {
      this.resetHands()
      
      // Deal 5 cards to player
      for (let i = 0; i < 5; i++) {
        const card = this.deck.pop()
        card.faceUp = true
        this.playerHand.push(card)
      }
      
      this.gamePhase = 'player-turn'
    },
    
    placeBet(amount) {
      if (amount <= this.credits) {
        this.currentBet = amount
        this.credits -= amount
        this.dealInitialCards()
      }
    },
    
    discardCards(indices) {
      // Replace cards at the given indices with new ones
      // This keeps cards in their original positions
      
      // Make a copy of the current hand
      const newHand = [...this.playerHand]
      
      // Replace each card at the discard indices
      for (const index of indices) {
        if (index >= 0 && index < this.playerHand.length && this.deck.length > 0) {
          const newCard = this.deck.pop()
          newCard.faceUp = true
          newHand[index] = newCard // Replace card at same position
        }
      }
      
      this.playerHand = newHand
      this.evaluateWinner()
    },
    
    stand() {
      this.evaluateWinner()
    },
    
    addCredits(amount) {
      // Add credits to the player's balance
      this.credits += Number(amount)
    },
    
    evaluateWinner() {
      const playerScore = this.playerScore
      this.winner = playerScore.type
      
      // Award winnings based on hand type
      let winMultiplier = 0
      
      switch (playerScore.type) {
        case 'Royal Flush':
          winMultiplier = 250
          break
        case 'Straight Flush':
          winMultiplier = 50
          break
        case 'Four of a Kind':
          winMultiplier = 25
          break
        case 'Full House':
          winMultiplier = 9
          break
        case 'Flush':
          winMultiplier = 6
          break
        case 'Straight':
          winMultiplier = 4
          break
        case 'Three of a Kind':
          winMultiplier = 3
          break
        case 'Two Pair':
          winMultiplier = 2
          break
        case 'Jacks or Better':
          winMultiplier = 1
          break
        default:
          winMultiplier = 0
      }
      
      if (winMultiplier > 0) {
        this.credits += this.currentBet * winMultiplier
      }
      
      this.gamePhase = 'showdown'
    }
  }
})

// Helper function to evaluate a poker hand
function evaluateHand(cards) {
  if (cards.length < 5) return { type: 'Invalid Hand', rank: 0 }
  
  // Sort cards by value with Aces high
  const sortedCards = [...cards].sort((a, b) => {
    const valueOrder = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 11, 'Q': 12, 'K': 13, 'A': 14
    }
    
    return valueOrder[a.value] - valueOrder[b.value]
  })
  
  // Helper functions
  const isFlush = cards.every(card => card.suit === cards[0].suit)
  
  const isStraight = (() => {
    for (let i = 1; i < sortedCards.length; i++) {
      const prevValue = getValue(sortedCards[i-1].value)
      const currValue = getValue(sortedCards[i].value)
      
      if (currValue - prevValue !== 1) {
        // Check for A-5 straight (special case)
        if (i === sortedCards.length - 1 &&
            sortedCards[0].value === '2' &&
            sortedCards[1].value === '3' &&
            sortedCards[2].value === '4' &&
            sortedCards[3].value === '5' &&
            sortedCards[4].value === 'A') {
          return true
        }
        return false
      }
    }
    return true
  })()
  
  // Count occurrences of each value
  const valueCounts = {}
  for (const card of cards) {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1
  }
  
  const counts = Object.values(valueCounts).sort((a, b) => b - a)
  
  // Check for royal flush
  if (isFlush && isStraight && sortedCards[0].value === '10') {
    return { type: 'Royal Flush', rank: 10 }
  }
  
  // Check for straight flush
  if (isFlush && isStraight) {
    return { type: 'Straight Flush', rank: 9 }
  }
  
  // Check for four of a kind
  if (counts[0] === 4) {
    return { type: 'Four of a Kind', rank: 8 }
  }
  
  // Check for full house
  if (counts[0] === 3 && counts[1] === 2) {
    return { type: 'Full House', rank: 7 }
  }
  
  // Check for flush
  if (isFlush) {
    return { type: 'Flush', rank: 6 }
  }
  
  // Check for straight
  if (isStraight) {
    return { type: 'Straight', rank: 5 }
  }
  
  // Check for three of a kind
  if (counts[0] === 3) {
    return { type: 'Three of a Kind', rank: 4 }
  }
  
  // Check for two pair
  if (counts[0] === 2 && counts[1] === 2) {
    return { type: 'Two Pair', rank: 3 }
  }
  
  // Check for one pair of jacks or better
  if (counts[0] === 2) {
    const pairValue = Object.keys(valueCounts).find(key => valueCounts[key] === 2)
    if (['J', 'Q', 'K', 'A'].includes(pairValue)) {
      return { type: 'Jacks or Better', rank: 2 }
    }
    return { type: 'One Pair', rank: 1 }
  }
  
  // High card
  return { type: 'High Card', rank: 0 }
}

// Helper function to get numeric value of card
function getValue(value) {
  const valueMap = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14
  }
  
  return valueMap[value] || 0
}

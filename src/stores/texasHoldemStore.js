import { defineStore } from 'pinia'

export const useTexasHoldemStore = defineStore('texasHoldem', {
  state: () => ({
    deck: [],
    communityCards: [],
    players: [
      { id: 0, name: 'You', chips: 1000, holeCards: [], folded: false, isPlayer: true, currentBet: 0, allIn: false },
      { id: 1, name: 'Bob', chips: 1000, holeCards: [], folded: false, isPlayer: false, currentBet: 0, allIn: false },
      { id: 2, name: 'Alice', chips: 1000, holeCards: [], folded: false, isPlayer: false, currentBet: 0, allIn: false },
      { id: 3, name: 'Charlie', chips: 1000, holeCards: [], folded: false, isPlayer: false, currentBet: 0, allIn: false },
    ],
    currentPlayerIndex: 0,
    dealerPosition: 0,
    smallBlindIndex: 1,
    bigBlindIndex: 2,
    pot: 0,
    sidePots: [],
    currentBet: 0,
    minRaise: 0,
    gamePhase: 'idle', // idle, pre-flop, flop, turn, river, showdown
    gameMessage: 'Welcome to Texas Hold\'em! Click "Start Game" to begin.',
    lastAction: '',
    winner: null,
    hands: [],
    smallBlindAmount: 10,
    bigBlindAmount: 20,
    lastBettor: null,
    bettingRoundComplete: false,
  }),
  
  getters: {
    currentPlayer: (state) => state.players[state.currentPlayerIndex],
    humanPlayer: (state) => state.players.find(p => p.isPlayer),
    activePlayers: (state) => state.players.filter(p => !p.folded && p.chips > 0),
    playersInHand: (state) => state.players.filter(p => !p.folded),
    isPlayerTurn: (state) => state.players[state.currentPlayerIndex].isPlayer,
    isHumanTurn: (state) => state.currentPlayerIndex === 0 && state.gamePhase !== 'idle' && state.gamePhase !== 'showdown',
  },
  
  actions: {
    initGame() {
      // Reset game state
      this.resetHands()
      this.communityCards = []
      this.pot = 0
      this.sidePots = []
      this.currentBet = 0
      this.minRaise = this.bigBlindAmount
      this.gamePhase = 'idle'
      this.gameMessage = 'Welcome to Texas Hold\'em! Click "Start Game" to begin.'
      this.lastAction = ''
      this.winner = null
      this.hands = []
      
      // Reset player states
      this.players.forEach(player => {
        player.folded = false
        player.currentBet = 0
        player.allIn = false
      })
      
      // Rotate dealer button
      this.dealerPosition = (this.dealerPosition + 1) % this.players.length
      this.smallBlindIndex = (this.dealerPosition + 1) % this.players.length
      this.bigBlindIndex = (this.dealerPosition + 2) % this.players.length
      
      // Create and shuffle deck
      this.createDeck()
      this.shuffleDeck()
    },
    
    startGame() {
      this.initGame()
      this.dealHoleCards()
      this.postBlinds()
      this.gamePhase = 'pre-flop'
      this.currentPlayerIndex = (this.bigBlindIndex + 1) % this.players.length
      this.gameMessage = `Round started. ${this.currentPlayer.name}'s turn.`
      
      // If AI is first to act, let them act
      this.processAiTurn()
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
      this.players.forEach(player => {
        player.holeCards = []
      })
    },
    
    dealHoleCards() {
      // Deal 2 hole cards to each player
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < this.players.length; j++) {
          const playerIndex = (this.dealerPosition + 1 + j) % this.players.length
          const card = this.deck.pop()
          // Only show the player's cards
          card.faceUp = this.players[playerIndex].isPlayer
          this.players[playerIndex].holeCards.push(card)
        }
      }
    },
    
    postBlinds() {
      // Small blind
      const sbPlayer = this.players[this.smallBlindIndex]
      const sbAmount = Math.min(sbPlayer.chips, this.smallBlindAmount)
      sbPlayer.chips -= sbAmount
      sbPlayer.currentBet = sbAmount
      this.pot += sbAmount
      
      // Big blind
      const bbPlayer = this.players[this.bigBlindIndex]
      const bbAmount = Math.min(bbPlayer.chips, this.bigBlindAmount)
      bbPlayer.chips -= bbAmount
      bbPlayer.currentBet = bbAmount
      this.pot += bbAmount
      
      this.currentBet = bbAmount
      this.minRaise = this.bigBlindAmount
      this.gameMessage = `Blinds posted. Small blind: ${sbAmount}, Big blind: ${bbAmount}`
    },
    
    dealFlop() {
      // Burn a card
      this.deck.pop()
      
      // Deal 3 cards for the flop
      for (let i = 0; i < 3; i++) {
        const card = this.deck.pop()
        card.faceUp = true
        this.communityCards.push(card)
      }
      
      this.gamePhase = 'flop'
      this.resetBettingRound()
      this.gameMessage = 'Flop dealt'
      
      // Check if human is active and set turn to them when it's their turn
      // This ensures the player always gets a chance to act on each street
      const humanPlayerIndex = this.players.findIndex(p => p.isPlayer && !p.folded)
      if (humanPlayerIndex !== -1) {
        // Find player after the human in rotation order
        const afterHumanIndex = (humanPlayerIndex + 1) % this.players.length
        
        // Set current player index to the player before human, so when we move to
        // next player, it will be the human player's turn first
        this.currentPlayerIndex = (humanPlayerIndex + this.players.length - 1) % this.players.length
        
        // Skip folded players
        this.moveToNextActivePlayer()
        
        // Only process AI turn if it's not the human player's turn
        if (!this.isPlayerTurn) {
          this.processAiTurn()
        }
      }
    },
    
    dealTurn() {
      // Burn a card
      this.deck.pop()
      
      // Deal the turn card
      const card = this.deck.pop()
      card.faceUp = true
      this.communityCards.push(card)
      
      this.gamePhase = 'turn'
      this.resetBettingRound()
      this.gameMessage = 'Turn dealt'
      
      // Check if human is active and set turn to them when it's their turn
      // This ensures the player always gets a chance to act on each street
      const humanPlayerIndex = this.players.findIndex(p => p.isPlayer && !p.folded)
      if (humanPlayerIndex !== -1) {
        // Find player after the human in rotation order
        const afterHumanIndex = (humanPlayerIndex + 1) % this.players.length
        
        // Set current player index to the player before human, so when we move to
        // next player, it will be the human player's turn first
        this.currentPlayerIndex = (humanPlayerIndex + this.players.length - 1) % this.players.length
        
        // Skip folded players
        this.moveToNextActivePlayer()
        
        // Only process AI turn if it's not the human player's turn
        if (!this.isPlayerTurn) {
          this.processAiTurn()
        }
      }
    },
    
    dealRiver() {
      // Burn a card
      this.deck.pop()
      
      // Deal the river card
      const card = this.deck.pop()
      card.faceUp = true
      this.communityCards.push(card)
      
      this.gamePhase = 'river'
      this.resetBettingRound()
      this.gameMessage = 'River dealt'
      
      // Check if human is active and set turn to them when it's their turn
      // This ensures the player always gets a chance to act on each street
      const humanPlayerIndex = this.players.findIndex(p => p.isPlayer && !p.folded)
      if (humanPlayerIndex !== -1) {
        // Find player after the human in rotation order
        const afterHumanIndex = (humanPlayerIndex + 1) % this.players.length
        
        // Set current player index to the player before human, so when we move to
        // next player, it will be the human player's turn first
        this.currentPlayerIndex = (humanPlayerIndex + this.players.length - 1) % this.players.length
        
        // Skip folded players
        this.moveToNextActivePlayer()
        
        // Only process AI turn if it's not the human player's turn
        if (!this.isPlayerTurn) {
          this.processAiTurn()
        }
      }
    },
    
    resetBettingRound() {
      // Reset all bets for a new round
      this.currentBet = 0
      this.lastBettor = null
      this.bettingRoundComplete = false
      
      this.players.forEach(player => {
        player.currentBet = 0
      })
      
      // After pre-flop, betting starts with the first active player after the button
      if (this.gamePhase !== 'pre-flop') {
        // Find the human player if they're still in the hand
        const humanPlayerIndex = this.players.findIndex(p => p.isPlayer && !p.folded)
        
        if (humanPlayerIndex !== -1) {
          // Give priority to the human player to act first after the flop
          // This ensures they always get a chance to act
          this.currentPlayerIndex = humanPlayerIndex
        } else {
          // If human has folded, start with the first active player after the dealer
          this.currentPlayerIndex = (this.dealerPosition + 1) % this.players.length
          // Skip folded or all-in players
          while (this.players[this.currentPlayerIndex].folded || this.players[this.currentPlayerIndex].allIn) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length
          }
        }
      } else {
        // Pre-flop betting starts with small blind
        this.currentPlayerIndex = this.smallBlindIndex
        
        // Skip players who are folded or all-in
        while (this.players[this.currentPlayerIndex].folded || this.players[this.currentPlayerIndex].allIn) {
          this.moveToNextActivePlayer()
        }
      }
    },
    
    check() {
      // Only allow check if currentBet is 0 or the player has already matched the current bet
      if (this.currentPlayer.currentBet < this.currentBet) {
        console.log("Cannot check - need to call or fold")
        return false
      }
      
      const player = this.players[this.currentPlayerIndex]
      this.lastAction = `${player.name} checks`
      this.gameMessage = this.lastAction
      
      this.nextTurn()
      return true
    },
    
    call() {
      const player = this.players[this.currentPlayerIndex]
      const callAmount = this.currentBet - player.currentBet
      
      if (callAmount <= 0) return false
      
      // All-in if player doesn't have enough chips
      const actualCallAmount = Math.min(callAmount, player.chips)
      player.chips -= actualCallAmount
      this.pot += actualCallAmount
      player.currentBet += actualCallAmount
      
      if (actualCallAmount < callAmount) {
        player.allIn = true
        this.lastAction = `${player.name} is all-in with ${player.currentBet}`
      } else {
        this.lastAction = `${player.name} calls ${actualCallAmount}`
      }
      
      this.gameMessage = this.lastAction
      
      // If this was the last player to act and all bets are matched
      // (Check here in addition to nextTurn to ensure betting round completes)
      const allPlayersActed = this.isBettingRoundComplete()
      
      this.nextTurn()
      return true
    },
    
    raise(amount) {
      const player = this.players[this.currentPlayerIndex]
      const minRaiseAmount = this.currentBet + this.minRaise
      
      // Cannot raise less than minimum
      if (amount < minRaiseAmount) return false
      
      // All-in if player doesn't have enough chips
      const raiseAmount = amount - player.currentBet
      if (raiseAmount > player.chips) return false
      
      player.chips -= raiseAmount
      this.pot += raiseAmount
      player.currentBet = amount
      this.currentBet = amount
      this.minRaise = amount - this.currentBet
      this.lastBettor = this.currentPlayerIndex
      
      this.lastAction = `${player.name} raises to ${amount}`
      this.gameMessage = this.lastAction
      
      this.nextTurn()
      return true
    },
    
    fold() {
      const player = this.players[this.currentPlayerIndex]
      player.folded = true
      
      this.lastAction = `${player.name} folds`
      this.gameMessage = this.lastAction
      
      // Check if only one player remains
      const remainingPlayers = this.players.filter(p => !p.folded)
      if (remainingPlayers.length === 1) {
        this.endHand(remainingPlayers[0])
        return true
      }
      
      this.nextTurn()
      return true
    },
    
    moveToNextActivePlayer() {
      // Find next active player
      let nextIndex = (this.currentPlayerIndex + 1) % this.players.length
      while (nextIndex !== this.currentPlayerIndex) {
        if (!this.players[nextIndex].folded && this.players[nextIndex].chips > 0) {
          this.currentPlayerIndex = nextIndex
          return
        }
        nextIndex = (nextIndex + 1) % this.players.length
      }
    },
    
    nextTurn() {
      // Store the state before moving to next player
      const prevPlayerIndex = this.currentPlayerIndex
      
      // Move to the next active player
      this.moveToNextActivePlayer()
      
      // If everyone folded except one player
      if (this.playersInHand.length <= 1) {
        this.endHand(this.playersInHand[0])
        return
      }
      
      // Check if betting round is complete
      const betsAreMatched = this.isBettingRoundComplete()
      
      // If no more active players to act or all bets are matched and equal
      if (betsAreMatched) {
        console.log('Betting round complete, advancing to next street')
        // Move to next phase (street)
        if (this.gamePhase === 'pre-flop') {
          // Save the action for after animation completes
          setTimeout(() => this.dealFlop(), 500)
          return
        } else if (this.gamePhase === 'flop') {
          setTimeout(() => this.dealTurn(), 500)
          return
        } else if (this.gamePhase === 'turn') {
          setTimeout(() => this.dealRiver(), 500)
          return
        } else if (this.gamePhase === 'river') {
          setTimeout(() => this.showdown(), 500)
          return
        }
      } else {
        this.gameMessage = `${this.currentPlayer.name}'s turn.`
        
        // Force a human player's turn if they're active
        // This is a safeguard to ensure human always gets a turn
        if (this.currentPlayer.isPlayer) {
          console.log('Human turn: waiting for input')
          return
        }
        
        // Only process AI turns if it's an AI player's turn
        if (!this.isPlayerTurn) {
          this.processAiTurn()
        }
      }
    },
    
    isBettingRoundComplete() {
      // Betting round is complete when all active players have:
      // 1. Contributed the same amount to the pot (currentBet) OR are all-in
      // 2. Had a chance to act
      
      // Players who haven't matched the current bet (and aren't all-in) still need to act
      const unmatchedBets = this.playersInHand.some(p => 
        p.currentBet < this.currentBet && !p.allIn
      )
      
      // If any player hasn't matched the bet, round is not complete
      if (unmatchedBets) {
        return false
      }
      
      // If everyone has matched bets, round is complete
      return true
    },
    
    showdown() {
      // Turn up all hole cards
      this.players.forEach(player => {
        if (!player.folded) {
          player.holeCards.forEach(card => {
            card.faceUp = true
          })
        }
      })
      
      this.gamePhase = 'showdown'
      this.gameMessage = 'Showdown!'
      
      // Evaluate all hands and determine winner
      this.evaluateHands()
      
      // Display the winner
      const winner = this.determineWinner()
      if (winner) {
        winner.chips += this.pot
        this.gameMessage = `${winner.name} wins with ${winner.handDescription}!`
        this.winner = winner
      } else {
        this.gameMessage = 'Split pot'
      }
      
      // Set the game to idle state so a new hand can be started
      setTimeout(() => {
        this.gamePhase = 'idle'
      }, 3000) // Show the results for 3 seconds before allowing a new hand
    },
    
    evaluateHands() {
      this.hands = []
      
      this.playersInHand.forEach(player => {
        const hand = this.evaluatePlayerHand(player)
        this.hands.push({
          playerId: player.id,
          playerName: player.name,
          hand,
          description: hand.type
        })
        player.handDescription = hand.type
      })
    },
    
    evaluatePlayerHand(player) {
      // Combine player's hole cards with community cards
      const cards = [...player.holeCards, ...this.communityCards]
      
      // Evaluate the best 5-card hand
      return evaluatePokerHand(cards)
    },
    
    determineWinner() {
      // Sort hands by rank (best to worst)
      this.hands.sort((a, b) => {
        // Compare hand types first (straight flush, four of a kind, etc.)
        if (a.hand.rank !== b.hand.rank) {
          return b.hand.rank - a.hand.rank
        }
        
        // If same hand type, compare card values
        if (a.hand.highCards && b.hand.highCards) {
          for (let i = 0; i < a.hand.highCards.length; i++) {
            if (a.hand.highCards[i] !== b.hand.highCards[i]) {
              return b.hand.highCards[i] - a.hand.highCards[i]
            }
          }
        }
        
        // It's a tie
        return 0
      })
      
      // Return the player with the best hand
      if (this.hands.length > 0) {
        const bestHand = this.hands[0]
        return this.players.find(p => p.id === bestHand.playerId)
      }
      
      return null
    },
    
    endHand(winner) {
      if (winner) {
        winner.chips += this.pot
        this.gameMessage = `${winner.name} wins the pot!`
        this.winner = winner
      }
      this.gamePhase = 'idle'
    },
    
    processAiTurn() {
      // Don't process if it's the human player's turn
      if (this.isPlayerTurn) return
      
      // Add a small delay to make AI decisions feel natural
      setTimeout(() => {
        const player = this.currentPlayer
        
        // Check again to make sure it's still an AI's turn
        // (The game state might have changed during the timeout)
        if (this.isPlayerTurn || this.gamePhase === 'idle' || this.gamePhase === 'showdown') {
          return
        }
        
        const callAmount = this.currentBet - player.currentBet
        
        // Very simple AI strategy - can be improved later
        const handStrength = this.getAiHandStrength(player)
        const randomFactor = Math.random() * 0.2
        
        if (callAmount === 0) {
          // Check or bet
          if (handStrength + randomFactor < 0.5) {
            this.check()
          } else {
            // Bet size based on hand strength
            const betSize = Math.floor((this.minRaise + (handStrength * this.pot * 0.5)) / 10) * 10
            const maxBet = Math.min(player.chips, this.currentBet + betSize)
            this.raise(this.currentBet + maxBet)
          }
        } else {
          // Call, raise or fold
          if (handStrength + randomFactor < 0.3) {
            this.fold()
          } else if (handStrength + randomFactor < 0.7) {
            this.call()
          } else {
            // Raise size based on hand strength
            const raiseSize = Math.floor((this.minRaise + (handStrength * this.pot * 0.5)) / 10) * 10
            const maxRaise = Math.min(player.chips, this.currentBet + raiseSize)
            this.raise(this.currentBet + maxRaise)
          }
        }
      }, 1000)
    },
    
    getAiHandStrength(player) {
      // Simplified hand strength evaluation - returns a value from 0 to 1
      if (this.gamePhase === 'pre-flop') {
        // Evaluate hole cards
        const card1 = player.holeCards[0].value
        const card2 = player.holeCards[1].value
        const sameSuit = player.holeCards[0].suit === player.holeCards[1].suit
        
        // High cards (A, K, Q)
        const highCards = ['A', 'K', 'Q'].includes(card1) && ['A', 'K', 'Q'].includes(card2)
        // Pairs
        const isPair = card1 === card2
        // Connected cards (can make a straight)
        const cardValues = '23456789TJQKA'
        const connected = Math.abs(cardValues.indexOf(card1) - cardValues.indexOf(card2)) <= 2
        
        if (isPair) {
          // Pair strength based on value
          const pairValue = cardValues.indexOf(card1) / cardValues.length
          return 0.7 + (pairValue * 0.3)
        } else if (highCards) {
          return 0.6 + (sameSuit ? 0.1 : 0)
        } else if (connected && sameSuit) {
          return 0.5
        } else if (connected) {
          return 0.4
        } else if (sameSuit) {
          return 0.35
        } else {
          // Random low-value hand
          return 0.2 + (Math.random() * 0.1)
        }
      } else {
        // With community cards, use the actual hand evaluation
        const hand = this.evaluatePlayerHand(player)
        
        // Map hand types to strength values
        const handStrengths = {
          'High Card': 0.1,
          'Pair': 0.3,
          'Two Pair': 0.5,
          'Three of a Kind': 0.6,
          'Straight': 0.7,
          'Flush': 0.8,
          'Full House': 0.85,
          'Four of a Kind': 0.9,
          'Straight Flush': 0.95,
          'Royal Flush': 1.0
        }
        
        return handStrengths[hand.type] || 0.1
      }
    },
    
    canCheck() {
      return this.currentPlayer.currentBet >= this.currentBet
    },
    
    canCall() {
      return this.currentBet > this.currentPlayer.currentBet && this.currentPlayer.chips > 0
    },
    
    minRaiseAmount() {
      return this.currentBet + this.minRaise
    },
    
    maxRaiseAmount() {
      return this.currentPlayer.currentBet + this.currentPlayer.chips
    },
    
    addChips(amount) {
      const humanPlayer = this.humanPlayer
      if (humanPlayer) {
        humanPlayer.chips += amount
      }
    },
    
    ensureHumanTurn() {
      // If there's an active human player who hasn't acted yet, force their turn
      const humanPlayer = this.players.find(p => p.isPlayer && !p.folded)
      if (humanPlayer && this.gamePhase !== 'idle' && this.gamePhase !== 'showdown') {
        this.currentPlayerIndex = 0
        this.gameMessage = `${humanPlayer.name}'s turn.`
        return true
      }
      return false
    }
  }
})

// Hand evaluation functions
function evaluatePokerHand(cards) {
  // Convert card values to numeric ranks for easier comparison
  const valueMap = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 }
  
  const numericCards = cards.map(card => ({
    suit: card.suit,
    value: card.value,
    rank: valueMap[card.value]
  }))
  
  // Sort cards by rank (descending)
  numericCards.sort((a, b) => b.rank - a.rank)
  
  // Check for royal flush
  const royalFlush = checkRoyalFlush(numericCards)
  if (royalFlush) {
    return { type: 'Royal Flush', rank: 9, highCards: [14] } // Ace high
  }
  
  // Check for straight flush
  const straightFlush = checkStraightFlush(numericCards)
  if (straightFlush) {
    return { type: 'Straight Flush', rank: 8, highCards: [straightFlush.highCard] }
  }
  
  // Check for four of a kind
  const fourOfAKind = checkFourOfAKind(numericCards)
  if (fourOfAKind) {
    return { type: 'Four of a Kind', rank: 7, highCards: fourOfAKind.highCards }
  }
  
  // Check for full house
  const fullHouse = checkFullHouse(numericCards)
  if (fullHouse) {
    return { type: 'Full House', rank: 6, highCards: fullHouse.highCards }
  }
  
  // Check for flush
  const flush = checkFlush(numericCards)
  if (flush) {
    return { type: 'Flush', rank: 5, highCards: flush.highCards }
  }
  
  // Check for straight
  const straight = checkStraight(numericCards)
  if (straight) {
    return { type: 'Straight', rank: 4, highCards: [straight.highCard] }
  }
  
  // Check for three of a kind
  const threeOfAKind = checkThreeOfAKind(numericCards)
  if (threeOfAKind) {
    return { type: 'Three of a Kind', rank: 3, highCards: threeOfAKind.highCards }
  }
  
  // Check for two pair
  const twoPair = checkTwoPair(numericCards)
  if (twoPair) {
    return { type: 'Two Pair', rank: 2, highCards: twoPair.highCards }
  }
  
  // Check for pair
  const pair = checkPair(numericCards)
  if (pair) {
    return { type: 'Pair', rank: 1, highCards: pair.highCards }
  }
  
  // High card
  return { type: 'High Card', rank: 0, highCards: numericCards.slice(0, 5).map(c => c.rank) }
}

function checkRoyalFlush(cards) {
  // A royal flush is a straight flush with an Ace high
  const straightFlush = checkStraightFlush(cards)
  return straightFlush && straightFlush.highCard === 14
}

function checkStraightFlush(cards) {
  // Group cards by suit
  const suits = {}
  cards.forEach(card => {
    if (!suits[card.suit]) suits[card.suit] = []
    suits[card.suit].push(card)
  })
  
  // Check each suit group for a straight
  for (const suit in suits) {
    if (suits[suit].length >= 5) {
      const sortedSuitCards = suits[suit].sort((a, b) => b.rank - a.rank)
      const straight = checkStraight(sortedSuitCards)
      if (straight) {
        return { highCard: straight.highCard }
      }
    }
  }
  
  return null
}

function checkFourOfAKind(cards) {
  // Group cards by rank
  const ranks = {}
  cards.forEach(card => {
    if (!ranks[card.rank]) ranks[card.rank] = []
    ranks[card.rank].push(card)
  })
  
  for (const rank in ranks) {
    if (ranks[rank].length === 4) {
      // Find kicker (highest card not in the four of a kind)
      const kickers = cards.filter(card => card.rank !== parseInt(rank))
      const kicker = kickers.length > 0 ? kickers[0].rank : 0
      return { highCards: [parseInt(rank), kicker] }
    }
  }
  
  return null
}

function checkFullHouse(cards) {
  // Group cards by rank
  const ranks = {}
  cards.forEach(card => {
    if (!ranks[card.rank]) ranks[card.rank] = []
    ranks[card.rank].push(card)
  })
  
  let threeOfAKind = null
  let pair = null
  
  // Find three of a kind
  for (const rank in ranks) {
    if (ranks[rank].length >= 3 && (!threeOfAKind || parseInt(rank) > threeOfAKind)) {
      threeOfAKind = parseInt(rank)
    }
  }
  
  // Find pair (not part of the three of a kind)
  for (const rank in ranks) {
    if (parseInt(rank) !== threeOfAKind && ranks[rank].length >= 2 && (!pair || parseInt(rank) > pair)) {
      pair = parseInt(rank)
    }
  }
  
  if (threeOfAKind && pair) {
    return { highCards: [threeOfAKind, pair] }
  }
  
  return null
}

function checkFlush(cards) {
  // Group cards by suit
  const suits = {}
  cards.forEach(card => {
    if (!suits[card.suit]) suits[card.suit] = []
    suits[card.suit].push(card)
  })
  
  for (const suit in suits) {
    if (suits[suit].length >= 5) {
      // Get the highest 5 cards of the flush
      const sortedSuitCards = suits[suit].sort((a, b) => b.rank - a.rank)
      return { highCards: sortedSuitCards.slice(0, 5).map(c => c.rank) }
    }
  }
  
  return null
}

function checkStraight(cards) {
  // Handle special case for A-2-3-4-5 straight
  const aceOneLow = cards.find(c => c.rank === 14) ? true : false
  if (aceOneLow) {
    const aceCard = { ...cards.find(c => c.rank === 14), rank: 1 }
    cards = [...cards, aceCard]
  }
  
  // Remove duplicate ranks
  const uniqueRanks = Array.from(new Set(cards.map(c => c.rank))).sort((a, b) => b - a)
  
  // Look for 5 consecutive ranks
  for (let i = 0; i < uniqueRanks.length - 4; i++) {
    if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
      return { highCard: uniqueRanks[i] }
    }
  }
  
  return null
}

function checkThreeOfAKind(cards) {
  // Group cards by rank
  const ranks = {}
  cards.forEach(card => {
    if (!ranks[card.rank]) ranks[card.rank] = []
    ranks[card.rank].push(card)
  })
  
  for (const rank in ranks) {
    if (ranks[rank].length === 3) {
      // Find kickers (two highest cards not in the three of a kind)
      const kickers = cards.filter(card => card.rank !== parseInt(rank))
      const kicker = kickers.length > 0 ? kickers[0].rank : 0
      return { highCards: [parseInt(rank), kicker] }
    }
  }
  
  return null
}

function checkTwoPair(cards) {
  // Group cards by rank
  const ranks = {}
  cards.forEach(card => {
    if (!ranks[card.rank]) ranks[card.rank] = []
    ranks[card.rank].push(card)
  })
  
  const pairs = []
  for (const rank in ranks) {
    if (ranks[rank].length >= 2) {
      pairs.push(parseInt(rank))
    }
  }
  
  // Sort pairs by rank (descending)
  pairs.sort((a, b) => b - a)
  
  if (pairs.length >= 2) {
    // Two highest pairs
    const topTwoPairs = pairs.slice(0, 2)
    
    // Find kicker (highest card not in either pair)
    const kickers = cards.filter(card => !topTwoPairs.includes(card.rank)).slice(0, 1)
    return { highCards: [...topTwoPairs, ...kickers.map(c => c.rank)] }
  }
  
  return null
}

function checkPair(cards) {
  // Group cards by rank
  const ranks = {}
  cards.forEach(card => {
    if (!ranks[card.rank]) ranks[card.rank] = []
    ranks[card.rank].push(card)
  })
  
  for (const rank in ranks) {
    if (ranks[rank].length === 2) {
      // Find kickers (three highest cards not in the pair)
      const kickers = cards.filter(card => card.rank !== parseInt(rank)).slice(0, 3)
      return { highCards: [parseInt(rank), ...kickers.map(c => c.rank)] }
    }
  }
  
  return null
}

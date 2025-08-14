import React, { useState, useCallback, useEffect } from 'react';

// Types
interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number; // 2-14 (11=Jack, 12=Queen, 13=King, 14=Ace)
  id: string;
}

interface Player {
  id: string;
  name: string;
  hand: Card[];
  faceDownCards: Card[];
  faceUpCards: Card[];
  isAI: boolean;
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  pile: Card[];
  deck: Card[];
  gamePhase: 'setup' | 'swapping' | 'playing' | 'finished';
  winner: string | null;
  loser: string | null;
}

// Utility functions
const createDeck = (): Card[] => {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (let rank = 2; rank <= 14; rank++) {
      deck.push({
        suit,
        rank,
        id: `${suit}-${rank}-${Math.random().toString(36).substr(2, 9)}`
      });
    }
  }
  
  return shuffleDeck(deck);
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

const getCardDisplay = (rank: number): string => {
  switch (rank) {
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    case 14: return 'A';
    default: return rank.toString();
  }
};

const getSuitSymbol = (suit: Card['suit']): string => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
  }
};

const getSuitColor = (suit: Card['suit']): string => {
  return suit === 'hearts' || suit === 'diamonds' ? '#dc2626' : '#1f2937';
};

const canPlayCard = (card: Card, topCard: Card | null): boolean => {
  if (!topCard) return true;
  
  // Special rules
  if (card.rank === 2) return true; // 2s can be played on anything
  if (card.rank === 10) return true; // 10s can be played on anything
  if (topCard.rank === 7) return card.rank <= 7; // Must play 7 or lower on 7
  
  // Normal rule: play equal or higher
  return card.rank >= topCard.rank;
};

const shouldBurn = (pile: Card[]): boolean => {
  if (pile.length < 4) return false;
  
  // Check if last 4 cards are the same rank
  const lastFour = pile.slice(-4);
  return lastFour.every(card => card.rank === lastFour[0].rank);
};

// Card Component
const CardComponent: React.FC<{
  card: Card | null;
  faceDown?: boolean;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
  disabled?: boolean;
}> = ({ card, faceDown = false, onClick, className = '', selected = false, disabled = false }) => {
  if (!card) {
    return (
      <div className={`w-16 h-24 border-2 border-dashed border-gray-400 rounded-lg ${className}`} />
    );
  }

  const isSpecialCard = card.rank === 2 || card.rank === 7 || card.rank === 10;

  return (
    <div
      className={`
        relative w-16 h-24 rounded-lg cursor-pointer transition-all duration-200 shadow-lg
        ${faceDown 
          ? 'bg-blue-800 border-2 border-blue-600' 
          : 'bg-white border-2 border-gray-300 hover:shadow-xl'
        }
        ${onClick && !disabled ? 'hover:scale-105 hover:-translate-y-1' : ''}
        ${selected ? 'ring-4 ring-yellow-400 scale-105 -translate-y-2 shadow-2xl' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isSpecialCard && !faceDown ? 'ring-2 ring-purple-400 ring-opacity-50' : ''}
        ${className}
      `}
      onClick={onClick && !disabled ? onClick : undefined}
    >
      {faceDown ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full relative overflow-hidden rounded-lg">
            <div className="absolute inset-2 border-2 border-blue-300 rounded-lg opacity-60" />
            <div className="absolute inset-4 border border-blue-200 rounded-lg opacity-40" />
          </div>
        </div>
      ) : (
        <>
          {/* Top-left corner */}
          <div className="absolute top-1 left-1 text-xs font-bold" style={{ color: getSuitColor(card.suit) }}>
            <div className="leading-none">{getCardDisplay(card.rank)}</div>
            <div className="text-sm leading-none">{getSuitSymbol(card.suit)}</div>
          </div>
          
          {/* Center symbol */}
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold" style={{ color: getSuitColor(card.suit) }}>
            {getSuitSymbol(card.suit)}
          </div>
          
          {/* Bottom-right corner (rotated) */}
          <div className="absolute bottom-1 right-1 text-xs font-bold transform rotate-180" style={{ color: getSuitColor(card.suit) }}>
            <div className="leading-none">{getCardDisplay(card.rank)}</div>
            <div className="text-sm leading-none">{getSuitSymbol(card.suit)}</div>
          </div>
          
          {/* Special card indicators */}
          {isSpecialCard && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-white" />
          )}
        </>
      )}
    </div>
  );
};

function App() {
  const [gameState, setGameState] = useState<GameState>({
    players: [
      { id: 'human', name: 'You', hand: [], faceDownCards: [], faceUpCards: [], isAI: false },
      { id: 'ai1', name: 'Alice', hand: [], faceDownCards: [], faceUpCards: [], isAI: true },
      { id: 'ai2', name: 'Bob', hand: [], faceDownCards: [], faceUpCards: [], isAI: true },
      { id: 'ai3', name: 'Carol', hand: [], faceDownCards: [], faceUpCards: [], isAI: true }
    ],
    currentPlayerIndex: 0,
    pile: [],
    deck: [],
    gamePhase: 'setup',
    winner: null,
    loser: null
  });
  
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const dealCards = useCallback(() => {
    const deck = createDeck();
    const players = [
      { id: 'human', name: 'You', hand: [], faceDownCards: [], faceUpCards: [], isAI: false },
      { id: 'ai1', name: 'Alice', hand: [], faceDownCards: [], faceUpCards: [], isAI: true },
      { id: 'ai2', name: 'Bob', hand: [], faceDownCards: [], faceUpCards: [], isAI: true },
      { id: 'ai3', name: 'Carol', hand: [], faceDownCards: [], faceUpCards: [], isAI: true }
    ];
    
    // Deal 6 cards to each player's hand
    let deckIndex = 0;
    for (let round = 0; round < 6; round++) {
      for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
        players[playerIndex].hand.push(deck[deckIndex++]);
      }
    }
    
    // Deal 3 face-down cards to each player
    for (let round = 0; round < 3; round++) {
      for (let playerIndex = 0; playerIndex < players.length; playerIndex++) {
        players[playerIndex].faceDownCards.push(deck[deckIndex++]);
      }
    }
    
    // AI players automatically choose their 3 worst cards as face-up
    for (let playerIndex = 1; playerIndex < players.length; playerIndex++) {
      const aiPlayer = players[playerIndex];
      const sortedHand = [...aiPlayer.hand].sort((a, b) => a.rank - b.rank);
      const faceUpCards = sortedHand.slice(0, 3);
      
      faceUpCards.forEach(card => {
        const handIndex = aiPlayer.hand.findIndex(c => c.id === card.id);
        if (handIndex !== -1) {
          aiPlayer.hand.splice(handIndex, 1);
          aiPlayer.faceUpCards.push(card);
        }
      });
    }
    
    const remainingDeck = deck.slice(deckIndex);
    
    setGameState({
      players,
      currentPlayerIndex: 0,
      pile: [],
      deck: remainingDeck,
      gamePhase: 'setup',
      winner: null,
      loser: null
    });
    
    setSelectedCards([]);
  }, []);

  const handleCardClick = useCallback((card: Card, source: 'hand' | 'faceUp') => {
    if (gameState.gamePhase === 'setup' && gameState.currentPlayerIndex === 0) {
      if (source === 'hand') {
        setGameState(prev => {
          const newPlayers = [...prev.players];
          const humanPlayer = newPlayers[0];
          
          if (humanPlayer.faceUpCards.length >= 3) {
            return prev;
          }
          
          const handIndex = humanPlayer.hand.findIndex(c => c.id === card.id);
          if (handIndex !== -1) {
            const cardToMove = humanPlayer.hand.splice(handIndex, 1)[0];
            humanPlayer.faceUpCards.push(cardToMove);
          }
          
          return { ...prev, players: newPlayers };
        });
      } else if (source === 'faceUp') {
        setGameState(prev => {
          const newPlayers = [...prev.players];
          const humanPlayer = newPlayers[0];
          
          const faceUpIndex = humanPlayer.faceUpCards.findIndex(c => c.id === card.id);
          if (faceUpIndex !== -1) {
            const cardToMove = humanPlayer.faceUpCards.splice(faceUpIndex, 1)[0];
            humanPlayer.hand.push(cardToMove);
          }
          
          return { ...prev, players: newPlayers };
        });
      }
    } else if (gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === 0) {
      const humanPlayer = gameState.players[0];
      
      if (source === 'faceUp' && humanPlayer.hand.length > 0) {
        return;
      }
      
      setSelectedCards(prev => {
        const isSelected = prev.some(c => c.id === card.id);
        if (isSelected) {
          return prev.filter(c => c.id !== card.id);
        } else {
          if (prev.length === 0 || prev[0].rank === card.rank) {
            return [...prev, card];
          }
          return [card];
        }
      });
    }
  }, [gameState.gamePhase, gameState.currentPlayerIndex, gameState.players]);

  const canPlaySelected = useCallback(() => {
    if (selectedCards.length === 0) return false;
    const topCard = gameState.pile.length > 0 ? gameState.pile[gameState.pile.length - 1] : null;
    return canPlayCard(selectedCards[0], topCard);
  }, [selectedCards, gameState.pile]);

  const playCards = useCallback(() => {
    if (!canPlaySelected()) return;
    
    setGameState(prev => {
      const newPlayers = [...prev.players];
      const currentPlayer = newPlayers[prev.currentPlayerIndex];
      const newPile = [...prev.pile, ...selectedCards];
      
      selectedCards.forEach(card => {
        const handIndex = currentPlayer.hand.findIndex(c => c.id === card.id);
        const faceUpIndex = currentPlayer.faceUpCards.findIndex(c => c.id === card.id);
        
        if (handIndex !== -1) {
          currentPlayer.hand.splice(handIndex, 1);
        } else if (faceUpIndex !== -1) {
          currentPlayer.faceUpCards.splice(faceUpIndex, 1);
        }
      });
      
      let burnPile = false;
      if (shouldBurn(newPile)) {
        burnPile = true;
      }
      
      const hasTen = selectedCards.some(card => card.rank === 10);
      if (hasTen || burnPile) {
        return {
          ...prev,
          players: newPlayers,
          pile: [],
        };
      }
      
      const hasWon = currentPlayer.hand.length === 0 && 
                   currentPlayer.faceUpCards.length === 0 && 
                   currentPlayer.faceDownCards.length === 0;
      
      if (hasWon) {
        return {
          ...prev,
          players: newPlayers,
          pile: newPile,
          gamePhase: 'finished',
          winner: currentPlayer.id
        };
      }
      
      return {
        ...prev,
        players: newPlayers,
        pile: newPile,
        currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length
      };
    });
    
    setSelectedCards([]);
  }, [selectedCards, canPlaySelected]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing'
    }));
  }, []);

  const humanPlayer = gameState.players[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Game info */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm">
          <h1 className="text-xl font-bold mb-2 text-yellow-300">Shithead</h1>
          <p className="text-sm mb-3">
            {gameState.gamePhase === 'setup' && humanPlayer.hand.length === 0 && 'Click "Deal Cards" to start'}
            {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length < 3 && 'Choose 3 cards for face-up'}
            {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length === 3 && 'Click "Start Game"'}
            {gameState.gamePhase === 'playing' && gameState.currentPlayerIndex === 0 && 'Your turn!'}
            {gameState.gamePhase === 'playing' && gameState.currentPlayerIndex !== 0 && `${gameState.players[gameState.currentPlayerIndex].name}'s turn`}
            {gameState.gamePhase === 'finished' && 'Game Over!'}
          </p>
          
          <div className="text-xs opacity-75 space-y-1">
            <div className="font-semibold text-yellow-200">Special Cards:</div>
            <div>• <span className="text-red-400">2</span> can be played on anything</div>
            <div>• <span className="text-red-400">7</span> forces next card ≤ 7</div>
            <div>• <span className="text-red-400">10</span> clears the pile</div>
          </div>
        </div>
      </div>

      {/* Center - Pile and Deck */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-8">
          {/* Deck */}
          <div className="text-center">
            <div className="text-white text-sm mb-2 font-bold">
              Deck ({gameState.deck.length})
            </div>
            <div className="relative">
              {gameState.deck.length > 0 ? (
                <CardComponent
                  card={{ suit: 'hearts', rank: 2, id: 'deck-back' }}
                  faceDown={true}
                />
              ) : (
                <div className="w-16 h-24 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                  Empty
                </div>
              )}
            </div>
          </div>

          {/* Pile */}
          <div className="text-center">
            <div className="text-white text-sm mb-2 font-bold">
              Pile ({gameState.pile.length})
            </div>
            <div className="relative w-20 h-28">
              {gameState.pile.length === 0 ? (
                <div className="w-full h-full border-2 border-dashed border-yellow-400 rounded-lg flex items-center justify-center text-yellow-400 text-xs">
                  Empty
                </div>
              ) : (
                <CardComponent
                  card={gameState.pile[gameState.pile.length - 1]}
                  className="absolute"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Human Player Area */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-3">
          {/* Face-down and Face-up cards */}
          <div className="flex gap-4 items-end">
            {/* Face-down cards */}
            <div className="flex gap-1">
              {humanPlayer.faceDownCards.map((_, index) => (
                <CardComponent
                  key={`facedown-${index}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-10 h-14"
                />
              ))}
            </div>
            
            {/* Face-up cards */}
            <div className="flex gap-1">
              {humanPlayer.faceUpCards.map((card) => (
                <CardComponent
                  key={card.id}
                  card={card}
                  className="w-10 h-14"
                  onClick={() => handleCardClick(card, 'faceUp')}
                  selected={selectedCards.some(c => c.id === card.id)}
                  disabled={humanPlayer.hand.length > 0 && gameState.gamePhase === 'playing'}
                />
              ))}
              {gameState.gamePhase === 'setup' && Array.from({ length: 3 - humanPlayer.faceUpCards.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="w-10 h-14 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs"
                >
                  ?
                </div>
              ))}
            </div>
          </div>
          
          {/* Hand */}
          {humanPlayer.hand.length > 0 && (
            <div className="flex gap-2 justify-center">
              {humanPlayer.hand.map((card) => (
                <CardComponent
                  key={card.id}
                  card={card}
                  className="w-14 h-20"
                  onClick={() => handleCardClick(card, 'hand')}
                  selected={selectedCards.some(c => c.id === card.id)}
                />
              ))}
            </div>
          )}
          
          {/* Player info */}
          <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl px-3 py-2 border-2 border-yellow-400">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-blue-500">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <div className="font-bold text-sm text-yellow-300">You</div>
                <div className="text-xs text-gray-300">
                  H:{humanPlayer.hand.length} U:{humanPlayer.faceUpCards.length} D:{humanPlayer.faceDownCards.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Players */}
      {gameState.players.slice(1).map((player, index) => {
        const positions = [
          { top: '4rem', left: '50%', transform: 'translateX(-50%)' }, // top
          { left: '1rem', top: '50%', transform: 'translateY(-50%)' }, // left  
          { right: '1rem', top: '50%', transform: 'translateY(-50%)' } // right
        ];
        
        return (
          <div key={player.id} className="absolute" style={positions[index]}>
            <div className="flex flex-col items-center gap-2">
              {/* Player info */}
              <div className={`bg-black bg-opacity-70 backdrop-blur-sm rounded-xl px-3 py-2 border-2 ${
                gameState.currentPlayerIndex === index + 1 ? 'border-yellow-400' : 'border-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full bg-green-500">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${
                      gameState.currentPlayerIndex === index + 1 ? 'text-yellow-300' : 'text-white'
                    }`}>
                      {player.name}
                    </div>
                    <div className="text-xs text-gray-300">
                      H:{player.hand.length} U:{player.faceUpCards.length} D:{player.faceDownCards.length}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hand (face-down for AI) */}
              {player.hand.length > 0 && (
                <div className="flex gap-1">
                  {player.hand.slice(0, 3).map((_, cardIndex) => (
                    <CardComponent
                      key={`hand-${cardIndex}`}
                      card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                      faceDown={true}
                      className="w-8 h-12"
                    />
                  ))}
                </div>
              )}
              
              {/* Face-up and face-down cards */}
              <div className="flex gap-2">
                {/* Face-down */}
                <div className="flex gap-1">
                  {player.faceDownCards.map((_, cardIndex) => (
                    <CardComponent
                      key={`facedown-${cardIndex}`}
                      card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                      faceDown={true}
                      className="w-8 h-12"
                    />
                  ))}
                </div>
                
                {/* Face-up */}
                <div className="flex gap-1">
                  {player.faceUpCards.map((card) => (
                    <CardComponent
                      key={card.id}
                      card={card}
                      className="w-8 h-12"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Action buttons */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-3">
          {/* Deal Cards */}
          {gameState.gamePhase === 'setup' && humanPlayer.hand.length === 0 && (
            <button
              onClick={dealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Deal Cards
            </button>
          )}
          
          {/* Start Game */}
          {gameState.gamePhase === 'setup' && humanPlayer.faceUpCards.length === 3 && (
            <button
              onClick={startGame}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Start Game
            </button>
          )}
          
          {/* Play Cards */}
          {gameState.gamePhase === 'playing' && 
           gameState.currentPlayerIndex === 0 && 
           selectedCards.length > 0 && (
            <button
              onClick={playCards}
              disabled={!canPlaySelected()}
              className={`px-6 py-3 rounded-lg font-bold transition-all transform shadow-lg ${
                canPlaySelected()
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Play Cards ({selectedCards.length})
            </button>
          )}
          
          {/* New Game */}
          {gameState.gamePhase === 'finished' && (
            <button
              onClick={dealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              New Game
            </button>
          )}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameState.winner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center max-w-md mx-4 shadow-2xl">
            <div className="mb-6">
              {gameState.winner === 'human' ? (
                <div className="text-green-600">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold">Victory!</h2>
                  <p className="text-lg mt-2">Congratulations! You won!</p>
                </div>
              ) : (
                <div className="text-red-600">
                  <div className="text-6xl mb-4">😞</div>
                  <h2 className="text-3xl font-bold">Game Over</h2>
                  <p className="text-lg mt-2">{gameState.players.find(p => p.id === gameState.winner)?.name} won!</p>
                </div>
              )}
            </div>
            
            <button
              onClick={dealCards}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
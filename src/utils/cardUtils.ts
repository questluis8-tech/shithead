import { Card } from '../types/game';

export const createDeck = (): Card[] => {
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

export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const getCardDisplay = (rank: number): string => {
  switch (rank) {
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    case 14: return 'A';
    default: return rank.toString();
  }
};

export const getSuitSymbol = (suit: Card['suit']): string => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
  }
};

export const getSuitColor = (suit: Card['suit']): string => {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-gray-900';
};

export const canPlayCard = (card: Card, topCard: Card | null): boolean => {
  if (!topCard) return true;
  
  // Special rules
  if (card.rank === 2) return true; // 2s can be played on anything
  if (card.rank === 10) return true; // 10s can be played on anything
  if (topCard.rank === 7) return card.rank <= 7; // Must play 7 or lower on 7
  
  // Normal rule: play equal or higher
  return card.rank >= topCard.rank;
};

export const shouldBurn = (pile: Card[]): boolean => {
  if (pile.length < 4) return false;
  
  // Check if last 4 cards are the same rank
  const lastFour = pile.slice(-4);
  return lastFour.every(card => card.rank === lastFour[0].rank);
};
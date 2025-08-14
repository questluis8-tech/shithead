export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: number; // 2-14 (11=Jack, 12=Queen, 13=King, 14=Ace)
  id: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  faceDownCards: Card[];
  faceUpCards: Card[];
  isAI: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  pile: Card[];
  deck: Card[];
  gamePhase: 'setup' | 'swapping' | 'playing' | 'finished';
  winner: string | null;
  loser: string | null;
}
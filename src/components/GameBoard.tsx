import React from 'react';
import { Player, Card as CardType } from '../types/game';
import { Card } from './Card';
import { getCardDisplay, getSuitSymbol } from '../utils/cardUtils';

interface GameBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  pile: CardType[];
  onCardClick: (card: CardType, source: 'hand' | 'faceUp') => void;
  selectedCards: CardType[];
  gamePhase: 'setup' | 'swapping' | 'playing' | 'finished';
}

export const GameBoard: React.FC<GameBoardProps> = ({
  players,
  currentPlayerIndex,
  pile,
  onCardClick,
  selectedCards,
  gamePhase
}) => {
  const humanPlayer = players[0];
  const aiPlayers = players.slice(1);
  const topCard = pile.length > 0 ? pile[pile.length - 1] : null;

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 overflow-hidden">
      {/* Felt texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent via-white to-transparent" />
      
      {/* AI Players positioned around the table */}
      {aiPlayers.map((player, index) => {
        const totalAI = aiPlayers.length;
        const angle = (index * 360) / totalAI - 90; // Start from top
        const radius = 200;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;
        
        return (
          <div
            key={player.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(35% + ${y}px)`
            }}
          >
            {/* Player name and status */}
            <div className={`text-center mb-2 ${currentPlayerIndex === players.indexOf(player) ? 'text-yellow-300' : 'text-white'}`}>
              <div className="text-sm font-bold">{player.name}</div>
              <div className="text-xs opacity-75">
                {player.hand.length} cards in hand
              </div>
            </div>
            
            {/* Face-down cards */}
            <div className="flex gap-1 justify-center mb-1">
              {player.faceDownCards.map((_, cardIndex) => (
                <Card
                  key={`${player.id}-down-${cardIndex}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-12 h-16"
                />
              ))}
            </div>
            
            {/* Face-up cards */}
            <div className="flex gap-1 justify-center mb-1">
              {player.faceUpCards.map((card, cardIndex) => (
                <Card
                  key={`${player.id}-up-${cardIndex}`}
                  card={card}
                  className="w-12 h-16"
                />
              ))}
            </div>
            
            {/* Hand (face-down for AI) */}
            <div className="flex gap-1 justify-center">
              {player.hand.slice(0, Math.min(5, player.hand.length)).map((_, cardIndex) => (
                <Card
                  key={`${player.id}-hand-${cardIndex}`}
                  card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                  faceDown={true}
                  className="w-10 h-14"
                />
              ))}
              {player.hand.length > 5 && (
                <div className="w-10 h-14 flex items-center justify-center text-white text-xs bg-black bg-opacity-30 rounded">
                  +{player.hand.length - 5}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Center pile */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-300 mb-2">Pile ({pile.length})</h2>
          {topCard && (
            <div className="text-sm text-white opacity-75">
              Last played: {getCardDisplay(topCard.rank)}{getSuitSymbol(topCard.suit)}
            </div>
          )}
        </div>
        
        <div className="relative w-20 h-28 mx-auto">
          {pile.length === 0 ? (
            <div className="w-full h-full border-2 border-dashed border-yellow-400 rounded-lg flex items-center justify-center text-yellow-400 text-xs">
              Empty
            </div>
          ) : (
            <>
              {/* Show multiple cards stacked */}
              {pile.slice(-3).map((card, index) => (
                <Card
                  key={card.id}
                  card={card}
                  className={`absolute transform ${
                    index === 0 ? 'rotate-2' : index === 1 ? '-rotate-1' : 'rotate-0'
                  }`}
                  style={{
                    zIndex: index,
                    left: `${index * 2}px`,
                    top: `${index * 1}px`
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Human player at bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className={`text-center mb-4 ${currentPlayerIndex === 0 ? 'text-yellow-300' : 'text-white'}`}>
          <div className="text-lg font-bold">{humanPlayer.name}</div>
          <div className="text-sm opacity-75">
            {gamePhase === 'swapping' ? 'Choose cards to swap' : 'Your turn'}
          </div>
        </div>
        
        {/* Face-down cards */}
        <div className="flex gap-2 justify-center mb-2">
          {humanPlayer.faceDownCards.map((_, cardIndex) => (
            <Card
              key={`human-down-${cardIndex}`}
              card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
              faceDown={true}
              className="w-14 h-20"
            />
          ))}
        </div>
        
        {/* Face-up cards */}
        <div className="flex gap-2 justify-center mb-2">
          {humanPlayer.faceUpCards.map((card, cardIndex) => (
            <Card
              key={`human-up-${cardIndex}`}
              card={card}
              onClick={() => onCardClick(card, 'faceUp')}
              selected={selectedCards.some(c => c.id === card.id)}
              disabled={gamePhase !== 'playing' || currentPlayerIndex !== 0}
              className="w-14 h-20"
            />
          ))}
        </div>
        
        {/* Hand */}
        <div className="flex gap-2 justify-center max-w-4xl mx-auto flex-wrap">
          {humanPlayer.hand.map((card, cardIndex) => (
            <Card
              key={card.id}
              card={card}
              onClick={() => onCardClick(card, 'hand')}
              selected={selectedCards.some(c => c.id === card.id)}
              disabled={gamePhase !== 'playing' && gamePhase !== 'swapping'}
              className="w-14 h-20"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Player, Card as CardType } from '../types/game';
import { Card } from './Card';
import { User, Bot } from 'lucide-react';

interface PlayerAreaProps {
  player: Player;
  isCurrentPlayer: boolean;
  isHuman: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  gamePhase: 'setup' | 'swapping' | 'playing' | 'finished';
  selectedCards?: CardType[];
  onCardClick?: (card: CardType, source: 'hand' | 'faceUp') => void;
  onPlayFaceDownCard?: (index: number) => void;
  canPlayAnyCard?: boolean;
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({
  player,
  isCurrentPlayer,
  isHuman,
  position,
  gamePhase,
  selectedCards = [],
  onCardClick,
  onPlayFaceDownCard,
  canPlayAnyCard = true
}) => {
  const renderPlayerInfo = () => (
    <div className={`
      bg-black bg-opacity-70 backdrop-blur-sm rounded-xl px-4 py-3 border-2 transition-all
      ${isCurrentPlayer ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' : 'border-gray-600'}
    `}>
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-full ${isHuman ? 'bg-blue-500' : 'bg-green-500'}`}>
          {isHuman ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-white" />
          )}
        </div>
        <div>
          <div className={`font-bold text-sm ${
            isCurrentPlayer ? 'text-yellow-300' : 'text-white'
          }`}>
            {player.name}
          </div>
          <div className="text-xs text-gray-300">
            H:{player.hand.length} U:{player.faceUpCards.length} D:{player.faceDownCards.length}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFaceDownCards = () => {
    if (player.faceDownCards.length === 0) return null;
    
    return (
      <div className="flex gap-1">
        {player.faceDownCards.map((_, index) => (
          <Card
            key={`facedown-${index}`}
            card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
            faceDown={true}
            className={`w-12 h-16 ${
              isHuman && 
              player.hand.length === 0 && 
              player.faceUpCards.length === 0 && 
              isCurrentPlayer && 
              gamePhase === 'playing'
                ? 'cursor-pointer hover:scale-110 hover:-translate-y-2'
                : ''
            }`}
            onClick={
              isHuman && 
              player.hand.length === 0 && 
              player.faceUpCards.length === 0 && 
              isCurrentPlayer && 
              gamePhase === 'playing' && 
              onPlayFaceDownCard
                ? () => onPlayFaceDownCard(index)
                : undefined
            }
          />
        ))}
      </div>
    );
  };

  const renderFaceUpCards = () => {
    const emptySlots = gamePhase === 'setup' && isHuman ? 3 - player.faceUpCards.length : 0;
    
    return (
      <div className="flex gap-1">
        {player.faceUpCards.map((card) => (
          <Card
            key={card.id}
            card={card}
            className="w-12 h-16"
            onClick={isHuman && onCardClick ? () => onCardClick(card, 'faceUp') : undefined}
            selected={selectedCards.some(c => c.id === card.id)}
            disabled={isHuman && player.hand.length > 0 && gamePhase === 'playing'}
          />
        ))}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="w-12 h-16 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs"
          >
            ?
          </div>
        ))}
      </div>
    );
  };

  const renderHand = () => {
    if (player.hand.length === 0) return null;

    if (!isHuman) {
      // AI player - show cards in a fan formation
      const cardCount = Math.min(player.hand.length, 8);
      const angleStep = position === 'top' || position === 'bottom' ? 8 : 12;
      const startAngle = -(cardCount - 1) * angleStep / 2;
      
      return (
        <div className="relative" style={{ width: '120px', height: '80px' }}>
          {Array.from({ length: cardCount }).map((_, index) => {
            const angle = startAngle + index * angleStep;
            const radius = position === 'top' || position === 'bottom' ? 30 : 25;
            const x = Math.sin((angle * Math.PI) / 180) * radius;
            const y = -Math.cos((angle * Math.PI) / 180) * radius * 0.3;
            
            return (
              <Card
                key={`hand-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                className="w-10 h-14 absolute"
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${angle}deg)`,
                  transformOrigin: 'center bottom',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-20px',
                  marginTop: '-28px',
                  zIndex: index
                }}
              />
            );
          })}
          {player.hand.length > 8 && (
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              +{player.hand.length - 8}
            </div>
          )}
        </div>
      );
    }

    // Human player - show cards in a spread at bottom
    return (
      <div className="flex gap-2 justify-center" style={{ maxWidth: '600px' }}>
        {player.hand.map((card, index) => {
          const totalCards = player.hand.length;
          const maxSpread = Math.min(totalCards, 10);
          const angle = totalCards > 1 ? ((index - (totalCards - 1) / 2) * 8) / (totalCards - 1) * (maxSpread - 1) : 0;
          const yOffset = Math.abs(angle) * 0.5;
          
          return (
            <Card
              key={card.id}
              card={card}
              className="w-16 h-22"
              onClick={onCardClick ? () => onCardClick(card, 'hand') : undefined}
              selected={selectedCards.some(c => c.id === card.id)}
              disabled={gamePhase !== 'playing' && gamePhase !== 'swapping' && gamePhase !== 'setup'}
              style={{
                transform: `rotate(${angle}deg) translateY(${yOffset}px)`,
                transformOrigin: 'center bottom',
                zIndex: selectedCards.some(c => c.id === card.id) ? 100 : index
              }}
            />
          );
        })}
      </div>
    );
  };

  // Layout based on position
  if (position === 'bottom') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4 items-end">
          {renderFaceDownCards()}
          {renderFaceUpCards()}
        </div>
        {renderHand()}
        {renderPlayerInfo()}
      </div>
    );
  }

  if (position === 'top') {
    return (
      <div className="flex flex-col items-center gap-3">
        {renderPlayerInfo()}
        {renderHand()}
        <div className="flex gap-2 items-start">
          {renderFaceDownCards()}
          {renderFaceUpCards()}
        </div>
      </div>
    );
  }

  if (position === 'left') {
    return (
      <div className="flex flex-col items-center gap-3">
        {renderPlayerInfo()}
        <div className="flex flex-col items-center gap-2">
          {renderFaceDownCards()}
          {renderFaceUpCards()}
        </div>
        {renderHand()}
      </div>
    );
  }

  if (position === 'right') {
    return (
      <div className="flex flex-col items-center gap-3">
        {renderPlayerInfo()}
        <div className="flex flex-col items-center gap-2">
          {renderFaceDownCards()}
          {renderFaceUpCards()}
        </div>
        {renderHand()}
      </div>
    );
  }

  return null;
};
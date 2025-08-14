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
  const getLayoutClasses = () => {
    switch (position) {
      case 'top':
        return 'flex-col items-center';
      case 'bottom':
        return 'flex-col-reverse items-center';
      case 'left':
        return 'flex-row items-center';
      case 'right':
        return 'flex-row-reverse items-center';
      default:
        return 'flex-col items-center';
    }
  };

  const getCardSize = () => {
    if (position === 'bottom') return 'w-16 h-24';
    return 'w-12 h-18';
  };

  const getHandCardSize = () => {
    if (position === 'bottom') return 'w-14 h-20';
    return 'w-10 h-14';
  };

  const renderPlayerInfo = () => (
    <div className={`bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-4 py-2 ${
      isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''
    }`}>
      <div className="flex items-center gap-2">
        {isHuman ? (
          <User size={16} className="text-blue-400" />
        ) : (
          <Bot size={16} className="text-green-400" />
        )}
        <span className={`font-bold text-sm ${
          isCurrentPlayer ? 'text-yellow-300' : 'text-white'
        }`}>
          {player.name}
        </span>
      </div>
      <div className="text-xs text-gray-300 mt-1">
        Hand: {player.hand.length} | Up: {player.faceUpCards.length} | Down: {player.faceDownCards.length}
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
            className={`${getCardSize()} ${
              isHuman && 
              player.hand.length === 0 && 
              player.faceUpCards.length === 0 && 
              isCurrentPlayer && 
              gamePhase === 'playing'
                ? 'cursor-pointer hover:scale-105 hover:-translate-y-1'
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
            className={getCardSize()}
            onClick={isHuman && onCardClick ? () => onCardClick(card, 'faceUp') : undefined}
            selected={selectedCards.some(c => c.id === card.id)}
            disabled={isHuman && player.hand.length > 0 && gamePhase === 'playing'}
          />
        ))}
        {/* Empty slots during setup */}
        {Array.from({ length: emptySlots }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className={`${getCardSize()} border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-400 text-xs`}
          >
            Empty
          </div>
        ))}
      </div>
    );
  };

  const renderHand = () => {
    if (player.hand.length === 0) return null;

    if (!isHuman) {
      // AI player - show face-down cards in a fan
      const maxVisible = position === 'left' || position === 'right' ? 5 : 7;
      const visibleCards = Math.min(player.hand.length, maxVisible);
      
      return (
        <div className="relative">
          {Array.from({ length: visibleCards }).map((_, index) => {
            const rotation = position === 'bottom' || position === 'top' 
              ? (index - (visibleCards - 1) / 2) * 5
              : (index - (visibleCards - 1) / 2) * 8;
            
            return (
              <Card
                key={`hand-${index}`}
                card={{ suit: 'hearts', rank: 2, id: 'dummy' }}
                faceDown={true}
                className={`${getHandCardSize()} absolute`}
                style={{
                  transform: `rotate(${rotation}deg) ${
                    position === 'left' || position === 'right' 
                      ? `translateY(${index * 8}px)`
                      : `translateX(${index * 12}px)`
                  }`,
                  zIndex: index
                }}
              />
            );
          })}
          {player.hand.length > maxVisible && (
            <div className={`${getHandCardSize()} absolute top-0 left-0 bg-black bg-opacity-70 rounded-lg flex items-center justify-center text-white text-xs font-bold`}
                 style={{ zIndex: maxVisible }}>
              +{player.hand.length - maxVisible}
            </div>
          )}
        </div>
      );
    }

    // Human player - show cards in a spread
    return (
      <div className="flex gap-2 flex-wrap justify-center max-w-4xl">
        {player.hand.map((card) => (
          <Card
            key={card.id}
            card={card}
            className={getHandCardSize()}
            onClick={onCardClick ? () => onCardClick(card, 'hand') : undefined}
            selected={selectedCards.some(c => c.id === card.id)}
            disabled={gamePhase !== 'playing' && gamePhase !== 'swapping' && gamePhase !== 'setup'}
          />
        ))}
      </div>
    );
  };

  const renderCards = () => {
    switch (position) {
      case 'top':
        return (
          <>
            {renderHand()}
            {renderFaceUpCards()}
            {renderFaceDownCards()}
          </>
        );
      case 'bottom':
        return (
          <>
            {renderFaceDownCards()}
            {renderFaceUpCards()}
            {renderHand()}
          </>
        );
      case 'left':
      case 'right':
        return (
          <div className="flex flex-col items-center gap-2">
            {renderFaceDownCards()}
            {renderFaceUpCards()}
            {renderHand()}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${getLayoutClasses()} gap-3`}>
      {position === 'bottom' && renderPlayerInfo()}
      {renderCards()}
      {position !== 'bottom' && renderPlayerInfo()}
    </div>
  );
};
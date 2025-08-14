import React from 'react';
import { Card as CardType } from '../types/game';
import { getCardDisplay, getSuitSymbol, getSuitColor } from '../utils/cardUtils';

interface CardProps {
  card: CardType | null;
  faceDown?: boolean;
  onClick?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  selected?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  faceDown = false,
  onClick,
  onMouseDown,
  onMouseUp,
  className = '',
  style,
  disabled = false,
  selected = false
}) => {
  const handleClick = (e: React.MouseEvent) => {
    console.log('Card click event triggered', { faceDown, disabled, card: card?.id });
    if (onClick && !disabled) {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }
  };

  if (!card) {
    return (
      <div className={`w-16 h-24 border-2 border-dashed border-gray-400 rounded-lg ${className}`} />
    );
  }

  const isSpecialCard = card.rank === 2 || card.rank === 7 || card.rank === 10;

  return (
    <div
      style={style}
      className={`
        relative w-16 h-24 rounded-lg cursor-pointer transition-all duration-200
        ${faceDown 
          ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-2 border-blue-500 shadow-lg' 
          : 'bg-white border-2 border-gray-300 shadow-lg hover:shadow-xl'
        }
        ${onClick && !disabled ? 'hover:scale-105 hover:-translate-y-1' : ''}
        ${selected ? 'ring-4 ring-yellow-400 ring-opacity-75 scale-110 -translate-y-3 shadow-2xl' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isSpecialCard && !faceDown ? 'ring-2 ring-purple-400 ring-opacity-50' : ''}
        ${className}
      `}
      onClick={handleClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {faceDown ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white rounded-full opacity-30" />
          <div className="absolute w-4 h-4 border-2 border-white rounded-full" />
        </div>
      ) : (
        <>
          {/* Top-left corner */}
          <div className={`absolute top-1 left-1 text-xs font-bold ${getSuitColor(card.suit)}`}>
            <div>{getCardDisplay(card.rank)}</div>
            <div className="text-lg leading-none">{getSuitSymbol(card.suit)}</div>
          </div>
          
          {/* Center symbol */}
          <div className={`absolute inset-0 flex items-center justify-center text-2xl ${getSuitColor(card.suit)}`}>
            {getSuitSymbol(card.suit)}
          </div>
          
          {/* Bottom-right corner (rotated) */}
          <div className={`absolute bottom-1 right-1 text-xs font-bold transform rotate-180 ${getSuitColor(card.suit)}`}>
            <div>{getCardDisplay(card.rank)}</div>
            <div className="text-lg leading-none">{getSuitSymbol(card.suit)}</div>
          </div>
          
          {/* Special card indicators */}
          {isSpecialCard && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-purple-500 rounded-full transform translate-x-1 -translate-y-1" />
          )}
        </>
      )}
    </div>
  );
};
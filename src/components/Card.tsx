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
  disabled?: boolean;
  selected?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  card,
  faceDown = false,
  onClick,
  onMouseDown,
  onMouseUp,
  className = '',
  disabled = false,
  selected = false,
  style
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !disabled) {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }
  };

  if (!card) {
    return (
      <div className={`border-2 border-dashed border-gray-400 rounded-lg ${className}`} style={style} />
    );
  }

  const isSpecialCard = card.rank === 2 || card.rank === 7 || card.rank === 10;

  return (
    <div
      className={`
        relative rounded-lg cursor-pointer transition-all duration-200 shadow-lg
        ${faceDown 
          ? 'bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 border-2 border-blue-600' 
          : 'bg-white border-2 border-gray-300 hover:shadow-xl'
        }
        ${onClick && !disabled ? 'hover:scale-105 hover:-translate-y-1' : ''}
        ${selected ? 'ring-4 ring-yellow-400 ring-opacity-75 scale-105 -translate-y-2 shadow-2xl' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isSpecialCard && !faceDown ? 'ring-2 ring-purple-400 ring-opacity-50' : ''}
        ${className}
      `}
      onClick={handleClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      style={style}
    >
      {faceDown ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Card back design */}
          <div className="w-full h-full relative overflow-hidden rounded-lg">
            <div className="absolute inset-2 border-2 border-blue-300 rounded-lg opacity-60" />
            <div className="absolute inset-4 border border-blue-200 rounded-lg opacity-40" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-2 border-blue-200 rounded-full opacity-50" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-200 rounded-full opacity-30" />
          </div>
        </div>
      ) : (
        <>
          {/* Top-left corner */}
          <div className={`absolute top-1 left-1 text-xs font-bold ${getSuitColor(card.suit)}`}>
            <div className="leading-none">{getCardDisplay(card.rank)}</div>
            <div className="text-sm leading-none">{getSuitSymbol(card.suit)}</div>
          </div>
          
          {/* Center symbol */}
          <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${getSuitColor(card.suit)}`}>
            {getSuitSymbol(card.suit)}
          </div>
          
          {/* Bottom-right corner (rotated) */}
          <div className={`absolute bottom-1 right-1 text-xs font-bold transform rotate-180 ${getSuitColor(card.suit)}`}>
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
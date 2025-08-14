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
  playerColor?: 'red' | 'blue' | 'black' | 'green';
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
  playerColor = 'blue'
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const getSpecialSymbol = () => {
    if (playerColor === 'red') {
      return '❦';
    } else if (playerColor === 'blue') {
      return '✦';
    } else if (playerColor === 'black') {
      return '✧';
    } else {
      return '❈';
    }
  };

  if (!card) {
    return (
      <div className={`w-16 h-24 border-2 border-dashed border-gray-400 rounded-lg ${className}`} />
    );
  }

  const isSpecialCard = card.rank === 2 || card.rank === 3 || card.rank === 7 || card.rank === 10;
  
  const getSpecialBorder = () => {
    if (card.rank === 2) return 'ring-2 ring-yellow-400 ring-opacity-75'; // Gold for 2s
    if (card.rank === 3) return 'ring-2 ring-gray-400 ring-opacity-40'; // Slightly invisible for 3s
    if (card.rank === 7) return 'ring-2 ring-blue-500 ring-opacity-75'; // Blue for 7s
    if (card.rank === 10) return 'ring-2 ring-red-500 ring-opacity-75 shadow-red-500/50 shadow-lg'; // Fire for 10s
    return '';
  };

  const getCardBackColor = () => {
    return 'bg-gradient-to-br from-gray-900 to-black';
  };

  const getOrnamentColor = () => {
    return 'text-gray-400';
  };

  const getBorderColor = () => {
    return 'border-gray-600';
  };

  return (
    <div
      className={`
        relative w-16 h-24 bg-white rounded-lg border-2 ${getBorderColor()}
        transition-all duration-200 cursor-pointer select-none
        ${onClick && !disabled ? 'hover:scale-105 hover:-translate-y-1' : ''}
        ${selected ? 'ring-4 ring-yellow-400 ring-opacity-75 scale-105 -translate-y-2' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${!faceDown ? getSpecialBorder() : ''}
        ${className}
      `}
      onClick={handleClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {faceDown ? (
        <div className={`absolute inset-0 ${getCardBackColor()} rounded-lg border-2 border-yellow-600`}>
          {/* Ornate corner decorations */}
          <div className={`absolute top-1 left-1 ${getOrnamentColor()} text-xs font-bold`}>
            {playerColor === 'red' && '❦'}
            {playerColor === 'blue' && '✦'}
            {playerColor === 'black' && '✧'}
            {playerColor === 'green' && '❈'}
          </div>
          <div className={`absolute top-1 right-1 ${getOrnamentColor()} text-xs font-bold`}>
            {playerColor === 'red' && '❦'}
            {playerColor === 'blue' && '✦'}
            {playerColor === 'black' && '✧'}
            {playerColor === 'green' && '❈'}
          </div>
          <div className={`absolute bottom-1 left-1 ${getOrnamentColor()} text-xs font-bold transform rotate-180`}>
            {playerColor === 'red' && '❦'}
            {playerColor === 'blue' && '✦'}
            {playerColor === 'black' && '✧'}
            {playerColor === 'green' && '❈'}
          </div>
          <div className={`absolute bottom-1 right-1 ${getOrnamentColor()} text-xs font-bold transform rotate-180`}>
            {playerColor === 'red' && '❦'}
            {playerColor === 'blue' && '✦'}
            {playerColor === 'black' && '✧'}
            {playerColor === 'green' && '❈'}
          </div>
          
          {/* Ornate border design */}
          <div className={`absolute inset-2 border border-opacity-50 rounded ${getOrnamentColor().replace('text-', 'border-')}`}>
            {/* Side decorations */}
            <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 ${getOrnamentColor()} text-xs`}>
              {playerColor === 'red' && '◈'}
              {playerColor === 'blue' && '❋'}
              {playerColor === 'black' && '✦'}
              {playerColor === 'green' && '❅'}
            </div>
            <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 ${getOrnamentColor()} text-xs`}>
              {playerColor === 'red' && '◈'}
              {playerColor === 'blue' && '❋'}
              {playerColor === 'black' && '✦'}
              {playerColor === 'green' && '❅'}
            </div>
            <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${getOrnamentColor()} text-xs`}>
              {playerColor === 'red' && '◈'}
              {playerColor === 'blue' && '❋'}
              {playerColor === 'black' && '✦'}
              {playerColor === 'green' && '❅'}
            </div>
            <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${getOrnamentColor()} text-xs`}>
              {playerColor === 'red' && '◈'}
              {playerColor === 'blue' && '❋'}
              {playerColor === 'black' && '✦'}
              {playerColor === 'green' && '❅'}
            </div>
          </div>
          
          {/* Center poop emoji */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl">💩</div>
          </div>
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
          
          {/* Special card decorations */}
          {card.rank === 2 && (
            <>
              {/* Gold stars for 2s */}
              <div className="absolute top-0 right-0 text-yellow-400 text-xs transform translate-x-1 -translate-y-1">⭐</div>
              <div className="absolute top-0 left-0 text-yellow-400 text-xs transform -translate-x-1 -translate-y-1">⭐</div>
            </>
          )}
          
          {card.rank === 7 && (
            <>
              {/* Down arrows for 7s */}
              <div className="absolute left-0 top-1/2 text-blue-500 text-xs transform -translate-x-1 -translate-y-1/2">↓</div>
              <div className="absolute right-0 top-1/2 text-blue-500 text-xs transform translate-x-1 -translate-y-1/2">↓</div>
            </>
          )}
          
          {card.rank === 10 && (
            <>
              {/* Fire effects for 10s */}
              <div className="absolute top-0 left-1/2 text-red-500 text-xs transform -translate-x-1/2 -translate-y-1">🔥</div>
              <div className="absolute bottom-0 left-1/2 text-red-500 text-xs transform -translate-x-1/2 translate-y-1">🔥</div>
            </>
          )}
        </>
      )}
    </div>
  );
};
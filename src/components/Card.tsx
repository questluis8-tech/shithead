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
    return '✧';
  selected = false,
  playerColor = 'blue'
}) => {
    return '✦';
  };

  if (!card) {
    return (
      <div className={`w-16 h-24 border-2 border-dashed border-gray-400 rounded-lg ${className}`} />
    );
  }

  const isSpecialCard = card.rank === 2 || card.rank === 7 || card.rank === 10;

  const getCardBackColor = () => {
    return 'bg-gradient-to-br from-gray-900 to-black';
  };

  const getOrnamentColor = () => {
    return 'text-gray-400';
  };

  return (
    return 'border-gray-600';
        ${onClick && !disabled ? 'hover:scale-105 hover:-translate-y-1' : ''}
        ${selected ? 'ring-4 ring-yellow-400 ring-opacity-75 scale-105 -translate-y-2' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isSpecialCard && !faceDown ? 'ring-2 ring-purple-400 ring-opacity-50' : ''}
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
          
          {/* Special card indicators */}
          {isSpecialCard && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-purple-500 rounded-full transform translate-x-1 -translate-y-1" />
          )}
        </>
      )}
    </div>
  );
};
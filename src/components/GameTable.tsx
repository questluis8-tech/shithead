import React from 'react';
import { GameState, Card as CardType } from '../types/game';
import { Card } from './Card';
import { PlayerArea } from './PlayerArea';

interface GameTableProps {
  gameState: GameState;
  selectedCards: CardType[];
  onCardClick: (card: CardType, source: 'hand' | 'faceUp') => void;
  onPlayFaceDownCard: (index: number) => void;
  canPlayAnyCard: boolean;
}

export const GameTable: React.FC<GameTableProps> = ({
  gameState,
  selectedCards,
  onCardClick,
  onPlayFaceDownCard,
  canPlayAnyCard
}) => {
  const { players, currentPlayerIndex, pile, deck, gamePhase } = gameState;
  const humanPlayer = players[0];
  const aiPlayers = players.slice(1);

  return (
    <div className="relative w-full h-screen">
      {/* Top Player (AI 1) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <PlayerArea
          player={aiPlayers[0]}
          isCurrentPlayer={currentPlayerIndex === 1}
          isHuman={false}
          position="top"
          gamePhase={gamePhase}
        />
      </div>

      {/* Left Player (AI 2) */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <PlayerArea
          player={aiPlayers[1]}
          isCurrentPlayer={currentPlayerIndex === 2}
          isHuman={false}
          position="left"
          gamePhase={gamePhase}
        />
      </div>

      {/* Right Player (AI 3) */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <PlayerArea
          player={aiPlayers[2]}
          isCurrentPlayer={currentPlayerIndex === 3}
          isHuman={false}
          position="right"
          gamePhase={gamePhase}
        />
      </div>

      {/* Center Area - Pile and Deck */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-8">
          {/* Deck */}
          <div className="text-center">
            <div className="text-white text-sm mb-2 font-bold">
              Deck ({deck.length})
            </div>
            <div className="relative">
              {deck.length > 0 ? (
                <>
                  <Card
                    card={{ suit: 'hearts', rank: 2, id: 'deck-back' }}
                    faceDown={true}
                    className="w-16 h-24"
                  />
                  {/* Stack effect */}
                  <div className="absolute -top-1 -left-1 w-16 h-24 bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-blue-600 rounded-lg -z-10" />
                  <div className="absolute -top-2 -left-2 w-16 h-24 bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-blue-600 rounded-lg -z-20" />
                </>
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
              Pile ({pile.length})
            </div>
            <div className="relative w-20 h-28">
              {pile.length === 0 ? (
                <div className="w-full h-full border-2 border-dashed border-yellow-400 rounded-lg flex items-center justify-center text-yellow-400 text-xs">
                  Empty
                </div>
              ) : (
                <>
                  {/* Show stack of cards */}
                  {pile.slice(-Math.min(3, pile.length)).map((card, index) => (
                    <Card
                      key={`pile-${index}`}
                      card={card}
                      className={`absolute w-16 h-24 ${
                        index === 0 ? 'rotate-1' : index === 1 ? '-rotate-1' : 'rotate-0'
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
        </div>
      </div>

      {/* Bottom Player (Human) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <PlayerArea
          player={humanPlayer}
          isCurrentPlayer={currentPlayerIndex === 0}
          isHuman={true}
          position="bottom"
          gamePhase={gamePhase}
          selectedCards={selectedCards}
          onCardClick={onCardClick}
          onPlayFaceDownCard={onPlayFaceDownCard}
          canPlayAnyCard={canPlayAnyCard}
        />
      </div>
    </div>
  );
};
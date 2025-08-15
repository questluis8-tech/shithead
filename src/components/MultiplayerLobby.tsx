import React from 'react';

interface MultiplayerLobbyProps {
  onBackToMenu: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  onBackToMenu
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 flex items-center justify-center">
      <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl p-12 text-center max-w-md">
        <h1 className="text-4xl font-bold text-white mb-8">Multiplayer Lobby</h1>
        <p className="text-white mb-8">Multiplayer features coming soon!</p>
        <button
          onClick={onBackToMenu}
          className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-bold text-xl transition-all transform hover:scale-105"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};
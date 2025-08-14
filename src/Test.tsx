import React from 'react';

export const Test = () => {
  console.log('Test component is rendering!');
  return (
    <div style={{ backgroundColor: 'red', minHeight: '100vh', color: 'white', padding: '20px' }}>
      <h1>Test Component Working!</h1>
      <p>If you see this, React is working</p>
    </div>
  );
};
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Test } from './Test.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Test />
  </StrictMode>
);
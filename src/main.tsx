import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preCacheAppAssets } from './utils/assetPreloader.ts';

// Pre-cache static icons and assets instantly
preCacheAppAssets();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


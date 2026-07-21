import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/* Fonts — ADB Fixo is the brand's primary display face (self-hosted,
   see styles/fonts.css); Inter is the secondary/body face. */
import './styles/fonts.css';
import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/inter/wght-italic.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sections.css';
/* Last — its Arabic/RTL corrections must win ties against the
   Latin-tuned component rules above. */
import './styles/rtl.css';

import { App } from './App';

/* JS is running — allow GSAP to own the reveal states. Without JS the
   `no-js` class keeps every piece of content visible. */
document.documentElement.classList.remove('no-js');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

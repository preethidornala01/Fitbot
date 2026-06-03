import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Track mouse movement globally to update CSS variables for soft background color blobs
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--mouse-x', `${x}%`);
    document.documentElement.style.setProperty('--mouse-y', `${y}%`);
  });

  // Inject the interactive background blobs container directly into body
  const container = document.createElement('div');
  container.className = 'interactive-blob-container';
  
  const blobSage = document.createElement('div');
  blobSage.className = 'interactive-blob blob-sage';
  
  const blobPeach = document.createElement('div');
  blobPeach.className = 'interactive-blob blob-peach';
  
  const blobWarm = document.createElement('div');
  blobWarm.className = 'interactive-blob blob-warm';
  
  container.appendChild(blobSage);
  container.appendChild(blobPeach);
  container.appendChild(blobWarm);
  
  // Append after document loads
  window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(container);
  });
  // Fallback in case DOM is already parsed
  if (document.body) {
    document.body.appendChild(container);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

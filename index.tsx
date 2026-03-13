import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Add logic to hide splash screen after app is mounted
const splashScreen = document.getElementById('splash-screen');
if (splashScreen) {
  // Wait a bit to ensure the app has had a chance to render, making the transition smoother.
  setTimeout(() => {
    splashScreen.classList.add('fade-out');
    // Once the fade-out transition ends, set display to none to remove it from the layout.
    splashScreen.addEventListener('transitionend', () => {
      splashScreen.style.display = 'none';
    }, { once: true });
  }, 500);
}

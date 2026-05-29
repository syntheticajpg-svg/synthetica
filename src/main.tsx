import {StrictMode, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function Root() {
  useEffect(() => {
    // Helper to check if the target is an input or textarea
    const isInput = (target: EventTarget | null) => {
      if (!target) return false;
      const t = target as HTMLElement;
      return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable;
    };

    // Disable right click
    const handleContextMenu = (e: MouseEvent) => {
      if (!isInput(e.target)) {
        e.preventDefault();
      }
    };
    
    // Disable copy
    const handleCopy = (e: ClipboardEvent) => {
      if (!isInput(e.target)) {
        e.preventDefault();
      }
    };

    // Disable keyboard shortcuts for copy/paste/inspect
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputActive = isInput(e.target);
      
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'x' || e.key === 'X' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')
      ) {
        // Only allow copy, paste, and cut if an input is active
        if (isInputActive && (e.key === 'v' || e.key === 'V' || e.key === 'c' || e.key === 'C' || e.key === 'x' || e.key === 'X')) {
          // Allow
        } else {
          e.preventDefault();
        }
      }
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);


import { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';

const REPULSION_RADIUS = 50;
const REPULSION_STRENGTH = 120;
const BUTTON_WIDTH = 120;
const BUTTON_HEIGHT = 48;

function App() {
  const [accepted, setAccepted] = useState(false);
  const [noPos, setNoPos] = useState(null);
  const noRef = useRef(null);
  const initialised = useRef(false);

  /* Centre the "No" button on first render so we have a controlled position */
  useEffect(() => {
    if (!initialised.current && noRef.current) {
      const rect = noRef.current.getBoundingClientRect();
      setNoPos({ x: rect.left, y: rect.top });
      initialised.current = true;
    }
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (accepted || !noPos) return;

      const cursorX = e.clientX;
      const cursorY = e.clientY;

      /* Centre of the No button */
      const btnCx = noPos.x + BUTTON_WIDTH / 2;
      const btnCy = noPos.y + BUTTON_HEIGHT / 2;

      const dx = btnCx - cursorX;
      const dy = btnCy - cursorY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPULSION_RADIUS) {
        /* Normalise the vector and push away */
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        let newX = noPos.x + nx * REPULSION_STRENGTH;
        let newY = noPos.y + ny * REPULSION_STRENGTH;

        /* Clamp to viewport */
        const maxX = window.innerWidth - BUTTON_WIDTH;
        const maxY = window.innerHeight - BUTTON_HEIGHT;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        setNoPos({ x: newX, y: newY });
      }
    },
    [noPos, accepted],
  );

  /* ---- Celebration state ---- */
  if (accepted) {
    return (
      <div className="celebration">
        <div
          className="background-layer"
          style={{ backgroundImage: 'url(/heart-bg.png)' }}
        />
        <div className="celebration-content">
          <h1 className="yay-text">YIPEEEEE!</h1>
          <img
            className="frog-img"
            src="/happy-frog.png"
            alt="Happy Frog"
          />
        </div>
      </div>
    );
  }

  /* ---- Proposal state ---- */
  return (
    <div className="proposal" onMouseMove={handleMouseMove}>
      <div
        className="background-layer"
        style={{ backgroundImage: 'url(/heart-bg.png)' }}
      />

      <main className="content">
        <h1 className="question">Do you want to be my valentine?</h1>

        <div className="button-row">
          <button className="btn btn-yes" onClick={() => setAccepted(true)}>
            Yes
          </button>
        </div>
      </main>

      {/* No button rendered with fixed position so it can roam freely */}
      <button
        ref={noRef}
        className="btn btn-no"
        style={
          noPos
            ? {
                position: 'fixed',
                left: noPos.x,
                top: noPos.y,
              }
            : undefined
        }
      >
        No
      </button>
    </div>
  );
}

export default App;

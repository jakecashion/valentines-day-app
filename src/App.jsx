import { useState, useRef } from 'react';
import './App.css';

// =========================================
// CONFIGURATION CONSTANTS
// =========================================
const REPULSION_RADIUS = 50;   // Pixels: How close the cursor must be to trigger movement
const REPULSION_STRENGTH = 120; // Pixels: Base distance the button "jumps" away
const BUTTON_WIDTH = 120;      // Pixels: Must match CSS width
const BUTTON_HEIGHT = 48;      // Pixels: Must match CSS height

function App() {
  // =========================================
  // STATE MANAGEMENT
  // =========================================
  const [accepted, setAccepted] = useState(false); // True = Show "YAY" screen
  
  // 'noPos' controls the Physics State:
  // - null   : Button is in "Layout Mode" (Static, side-by-side with Yes)
  // - object : Button is in "Physics Mode" ({ x: 100, y: 200 } - Fixed position)
  const [noPos, setNoPos] = useState(null); 
  
  // 'noCount' tracks how many times the user managed to click "No".
  // We use this to scale the buttons (punishment/reward mechanic).
  const [noCount, setNoCount] = useState(0); 
  
  const noRef = useRef(null); // Reference to the actual DOM element

  // =========================================
  // HANDLERS
  // =========================================

  // Triggered when the user successfully clicks "No"
  const handleNoClick = () => {
    // 1. Reset position: Snaps the button back to the row (Layout Mode)
    setNoPos(null);
    // 2. Punishment: Increment count to make "Yes" bigger and "No" smaller
    setNoCount(noCount + 1);
  };

  // The Core Physics Engine (Runs on every mouse move)
  const handleMouseMove = (e) => {
    // If accepted or if ref isn't ready, do nothing
    if (accepted || !noRef.current) return;

    const cursorX = e.clientX;
    const cursorY = e.clientY;

    // 1. CALCULATE CURRENT BUTTON POSITION
    // We need to know where the button is RIGHT NOW to determine distance.
    let currentRect;
    if (noPos) {
      // If running, use the React State position (Physics Mode)
      currentRect = { left: noPos.x, top: noPos.y };
    } else {
      // If static, use the Browser DOM position (Layout Mode)
      currentRect = noRef.current.getBoundingClientRect();
    }

    const btnCx = currentRect.left + BUTTON_WIDTH / 2;
    const btnCy = currentRect.top + BUTTON_HEIGHT / 2;

    const dx = btnCx - cursorX;
    const dy = btnCy - cursorY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 2. TRIGGER LOGIC
    if (dist < REPULSION_RADIUS) {
      
      // --- THE "INITIALIZATION FRAME" FIX ---
      // Problem: Switching from 'static' to 'fixed' causes a layout jump/teleport
      // if we move the button instantly.
      // Fix: First, we switch to 'fixed' at the EXACT SAME coordinates.
      // We return early to let React render this one frame.
      // The user sees nothing change, but the button is now "unlocked" from the row.
      if (noPos === null) {
        setNoPos({ x: currentRect.left, y: currentRect.top });
        return;
      }

      // --- CHAOS PHYSICS ---
      // Calculate angle directly away from mouse
      const angle = Math.atan2(dy, dx);
      
      // Add Jitter: +/- 90 degrees (Math.PI/2)
      // This makes the button dart sideways unpredictably
      const jitter = (Math.random() - 0.5) * Math.PI; 
      const finalAngle = angle + jitter;

      // Calculate vector direction
      const nx = Math.cos(finalAngle);
      const ny = Math.sin(finalAngle);

      // Variable Speed: Multiply strength by 1.0x to 2.0x
      const distanceMultiplier = 1 + Math.random(); 
      const runDistance = REPULSION_STRENGTH * distanceMultiplier;

      // Calculate new target coordinates
      let newX = noPos.x + nx * runDistance;
      let newY = noPos.y + ny * runDistance;

      // --- WALL CLAMPING ---
      // Ensure the button never flies off screen.
      const maxX = window.innerWidth - BUTTON_WIDTH;
      const maxY = window.innerHeight - BUTTON_HEIGHT;
      
      // Math.min/max constrains the value between 0 and ScreenSize
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      setNoPos({ x: newX, y: newY });
    }
  };

  // =========================================
  // VIEW: CELEBRATION (Success)
  // =========================================
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
          
          <h2 className="sub-text">
            Happy Valentines Abbie! I'm thankful you're mine! I love you!
          </h2>
        </div>
      </div>
    );
  }

  // =========================================
  // VIEW: PROPOSAL (Question)
  // =========================================
  return (
    <div className="proposal" onMouseMove={handleMouseMove}>
      <div
        className="background-layer"
        style={{ backgroundImage: 'url(/heart-bg.png)' }}
      />

      <main className="content">
        <h1 className="question">Do you want to be my valentine?</h1>

        <div className="button-row">
          {/* YES BUTTON */}
          <button
            className="btn btn-yes"
            onClick={() => setAccepted(true)}
            style={{ 
              // Grow by 25% per failed "No" click
              transform: `scale(${1 + noCount * 0.25})` 
            }}
          >
            Yes
          </button>

          {/* PHANTOM SPACER */}
          {/* This appears only when 'noPos' is set (button is running).
             It fills the void left in the row so 'Yes' glides smoothly 
             instead of snapping to the center.
          */}
          {noPos && <div className="phantom-spacer" />}

          {/* NO BUTTON */}
          <button
            ref={noRef}
            className="btn btn-no"
            onClick={handleNoClick}
            style={{
              // If running (noPos), switch to Fixed positioning
              ...(noPos
                ? {
                    position: 'fixed',
                    left: noPos.x,
                    top: noPos.y,
                    marginLeft: 0, // Remove margin so coordinate logic is exact
                  }
                : {}),
              // Shrink by 10% per click, capped at 50% size
              transform: `scale(${Math.max(0.5, 1 - noCount * 0.1)})`,
            }}
          >
            No
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
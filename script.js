// =============================================
// GAME STATE VARIABLES
// =============================================
let gameRunning = false;    // Tracks whether the game is currently active
let dropMaker;              // Stores the setInterval timer that spawns drops
let countdownInterval;      // Stores the setInterval timer for the countdown
let timeValue = 30;         // Countdown timer starting value (seconds)
let scoreValue = 0;         // Player's current score

// =============================================
// DOM REFERENCES
// =============================================
const scoreDisplay = document.getElementById("score");        // Score number display
const timerDisplay = document.getElementById("time");         // Timer number display
const startBtn = document.getElementById("start-btn");        // Start/Restart button
const gameContainer = document.getElementById("game-container"); // Game play area

// =============================================
// START GAME
// =============================================
startBtn.addEventListener("click", startGame);

function startGame() {
  // Reset everything so a restart works cleanly
  gameRunning = true;
  timeValue = 30;
  scoreValue = 0;

  // Reset displays
  scoreDisplay.textContent = scoreValue;
  timerDisplay.textContent = timeValue;

  // Clear any leftover drops from a previous game
  gameContainer.innerHTML = "";

  // Update button label
  startBtn.textContent = "Restart";

  // Remove old feedback message if present
  removeFeedback();

  // Start spawning drops every 800ms
  dropMaker = setInterval(createDrop, 800);

  // Start the countdown timer
  startCountdown();
}

// =============================================
// COUNTDOWN TIMER
// =============================================
function startCountdown() {
  // Clear any previous countdown that may still be running
  clearInterval(countdownInterval);

  countdownInterval = setInterval(function () {
    timeValue--;
    timerDisplay.textContent = timeValue;

    if (timeValue <= 0) {
      endGame(); // Time's up — stop everything
    }
  }, 1000);
}

// =============================================
// END GAME
// =============================================
function endGame() {
  gameRunning = false;

  // Stop spawning new drops
  clearInterval(dropMaker);

  // Stop the countdown
  clearInterval(countdownInterval);

  // Remove all remaining drops from the screen
  gameContainer.innerHTML = "";

  // Reset button label
  startBtn.textContent = "Play Again";

  // ✅ Check score at the end — 20+ is a win, below 20 is game over
  if (scoreValue >= 20) {
    showFeedback(`🏆 You Win! Final Score: ${scoreValue}`, "win");
    launchConfetti();
  } else {
    showFeedback(`⏱️ Time's up! Final score: ${scoreValue}`, "end");
  }
}

// =============================================
// CREATE A DROP
// =============================================
function createDrop() {
  // Don't spawn drops if game has stopped
  if (!gameRunning) return;

  const drop = document.createElement("div");

  // Randomly decide if this is a bad drop (30% chance)
  const isBad = Math.random() < 0.3;
  drop.className = isBad ? "water-drop bad-drop" : "water-drop";

  // Random size between 30px and 60px
  const size = Math.random() * 30 + 30;
  drop.style.width = drop.style.height = `${size}px`;

  // Random horizontal position — kept inside container bounds
  const xPosition = Math.random() * (gameContainer.offsetWidth - size);
  drop.style.left = `${xPosition}px`;

  // Random fall speed between 2.5s and 5s
  const fallDuration = Math.random() * 2.5 + 2.5;
  drop.style.animationDuration = `${fallDuration}s`;

  // Add the drop to the game area
  gameContainer.appendChild(drop);

  // ── Click handler ──────────────────────────────
  drop.addEventListener("click", function () {
    if (!gameRunning) return;

    if (isBad) {
      // Clicked a bad drop — lose 3 points (floor at 0)
      scoreValue = Math.max(0, scoreValue - 3);
      scoreDisplay.textContent = scoreValue;
      showFeedback("☠️ Bad drop! -3", "bad");
    } else {
      // Clicked a good drop — gain 1 point
      scoreValue++;
      scoreDisplay.textContent = scoreValue;
      showFeedback("💧 Nice catch! +1", "good");
    }

    drop.remove(); // Remove drop immediately on click
  });

  // ── Missed drop handler ────────────────────────
  drop.addEventListener("animationend", function () {
    if (!gameRunning) return;

    if (!isBad) {
      // Missed a good drop — lose 1 point (floor at 0)
      scoreValue = Math.max(0, scoreValue - 1);
      scoreDisplay.textContent = scoreValue;
      showFeedback("😬 Missed! -1", "bad");
    }

    drop.remove(); // Clean up the drop from the DOM
  });
}

// =============================================
// CONFETTI
// =============================================
function launchConfetti() {
  confetti({ particleCount: 120, spread: 80, origin: { x: 0.5, y: 0.5 } });
  setTimeout(() => {
    confetti({ particleCount: 80, spread: 60, origin: { x: 0.2, y: 0.4 } });
  }, 300);
  setTimeout(() => {
    confetti({ particleCount: 80, spread: 60, origin: { x: 0.8, y: 0.4 } });
  }, 600);
}

// =============================================
// FEEDBACK MESSAGES
// =============================================
let feedbackTimeout; // Stores the timeout so we can cancel it if needed

function showFeedback(message, type) {
  // Reuse existing feedback element or create a new one
  let feedback = document.getElementById("feedback");

  if (!feedback) {
    feedback = document.createElement("div");
    feedback.id = "feedback";
    gameContainer.appendChild(feedback);
  }

  feedback.textContent = message;
  feedback.className = `feedback feedback-${type}`; // e.g. feedback-good, feedback-bad, feedback-end

  // Clear any previous auto-hide timer
  clearTimeout(feedbackTimeout);

  // Keep win message visible; hide all others after 1 second
  feedbackTimeout = setTimeout(removeFeedback, type === "win" ? 9999999 : 1000);
}

function removeFeedback() {
  const feedback = document.getElementById("feedback");
  if (feedback) feedback.remove();
}

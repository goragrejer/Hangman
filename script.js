// --- Step 1: Set Up Game Variables and DOM References ---
const words = ["JAVASCRIPT", "CODING", "PROGRAMMING", "HANGMAN", "DEVELOPER"];
const MAX_GUESSES = 6;

let secretWord = '';
let guessedLetters = [];
let remainingGuesses = MAX_GUESSES;
let gameActive = false;

// DOM Element references
const wordDisplay = document.getElementById('word-display');
const guessesLeftSpan = document.getElementById('guesses-left');
const guessedLettersSpan = document.getElementById('guessed-letters');
const letterInput = document.getElementById('letter-input');
const guessButton = document.getElementById('guess-button');
const messageDisplay = document.getElementById('message');
const startButton = document.getElementById('start-button');

// --- Helper Functions ---

/**
 * Updates the word display (e.g., changes 'C_D_' to 'C O D E').
 * @returns {string} The formatted display string.
 */
function getDisplayWord() {
    let display = '';
    for (const letter of secretWord) {
        if (guessedLetters.includes(letter)) {
            display += letter + ' ';
        } else {
            display += '_ ';
        }
    }
    return display.trim();
}

/**
 * Checks for win/loss conditions and ends the game if met.
 */
function checkGameStatus() {
    const currentDisplay = getDisplayWord();
    
    // Check for Win: If there are no more underscores in the display
    if (!currentDisplay.includes('_')) {
        endGame(true);
        return;
    }

    // Check for Loss: If guesses run out
    if (remainingGuesses <= 0) {
        endGame(false);
    }
}

/**
 * Handles the end of the game (win or loss).
 * @param {boolean} won - True if the player won, false otherwise.
 */
function endGame(won) {
    gameActive = false;
    guessButton.disabled = true;
    letterInput.disabled = true;

    if (won) {
        messageDisplay.textContent = '🎉 YOU WON! 🎉';
        messageDisplay.style.color = '#28a745';
    } else {
        messageDisplay.textContent = `Game Over! The word was: ${secretWord}`;
        messageDisplay.style.color = '#dc3545';
        // Show the full word on loss
        wordDisplay.textContent = secretWord.split('').join(' ');
    }
}


// --- Main Game Logic Functions ---

/**
 * Initializes all game state and starts the game.
 */
function startGame() {
    // 1. Reset state
    secretWord = words[Math.floor(Math.random() * words.length)];
    guessedLetters = [];
    remainingGuesses = MAX_GUESSES;
    gameActive = true;

    // 2. Update DOM elements
    wordDisplay.textContent = getDisplayWord();
    guessesLeftSpan.textContent = remainingGuesses;
    guessedLettersSpan.textContent = '';
    messageDisplay.textContent = '';
    messageDisplay.style.color = '';
    letterInput.value = '';

    // 3. Enable input
    guessButton.disabled = false;
    letterInput.disabled = false;
    letterInput.focus();
    console.log(`New word selected: ${secretWord}`); // For testing!
}


/**
 * Processes the player's letter guess.
 */
function handleGuess() {
    if (!gameActive) {
        messageDisplay.textContent = "Please click 'Start New Game'!";
        return;
    }

    // Get input and clean it up (convert to uppercase for consistency)
    let guess = letterInput.value.trim().toUpperCase();
    letterInput.value = ''; // Clear input for next guess
    letterInput.focus();

    // Input Validation
    if (!guess || guess.length !== 1 || !/^[A-Z]$/.test(guess)) {
        messageDisplay.textContent = 'Please enter a single letter (A-Z).';
        return;
    }

    // Check if letter was already guessed
    if (guessedLetters.includes(guess)) {
        messageDisplay.textContent = `You already guessed the letter '${guess}'.`;
        return;
    }

    // Add guess to history and update display
    guessedLetters.push(guess);
    guessedLettersSpan.textContent = guessedLetters.join(', ');
    messageDisplay.textContent = ''; // Clear previous message

    // Check if guess is correct
    if (secretWord.includes(guess)) {
        // Correct guess: Update word display
        wordDisplay.textContent = getDisplayWord();
        messageDisplay.textContent = `Correct guess! '${guess}' is in the word.`;
    } else {
        // Incorrect guess: Decrement guesses
        remainingGuesses--;
        guessesLeftSpan.textContent = remainingGuesses;
        messageDisplay.textContent = `Incorrect guess! '${guess}' is not in the word.`;
    }

    // Check if the game has ended (win or loss)
    checkGameStatus();
}

// --- Event Listeners ---

// 1. Start button
startButton.addEventListener('click', startGame);

// 2. Guess button
guessButton.addEventListener('click', handleGuess);

// 3. Allow 'Enter' key press on the input field to submit
letterInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleGuess();
    }
});

// --- Initial Setup ---
// Run startGame once when the page loads to set up the initial display
startGame();

// --- Step 1: Set Up Game Variables and DOM References ---
const MAX_GUESSES = 6;
// Define the base URL for English words
const API_URL_ENGLISH = 'https://random-word-api.herokuapp.com/word?number=1';

let secretWord = '';
let guessedLetters = [];
let remainingGuesses = MAX_GUESSES;
let gameActive = false;
// Removed: let currentLanguage = 'EN';

// DOM Element references
const wordDisplay = document.getElementById('word-display');
const guessesLeftSpan = document.getElementById('guesses-left');
const guessedLettersSpan = document.getElementById('guessed-letters');
const letterInput = document.getElementById('letter-input');
const guessButton = document.getElementById('guess-button');
const messageDisplay = document.getElementById('message');
const startButton = document.getElementById('start-button');
// Removed: const languageToggleButton = document.getElementById('language-toggle'); 


// --- Helper Functions (UNCHANGED) ---

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
    
    if (!currentDisplay.includes('_')) {
        endGame(true);
        return;
    }

    if (remainingGuesses <= 0) {
        endGame(false);
    }
}

/**
 * Handles the end of the game (win or loss).
 * NOTE: Language checks are removed, only English messages remain.
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
        wordDisplay.textContent = secretWord.split('').join(' ');
    }
}


// --- Main Game Logic Functions ---

// Removed: toggleLanguage function

/**
 * Fetches a random word from the English API and initializes the game state.
 * NOTE: Logic is simplified as there's only one API and no language state.
 */
async function startGame() {
    // 1. URL is always English
    const API_URL = API_URL_ENGLISH;

    // Show loading state
    startButton.textContent = 'Fetching Word...';
    startButton.disabled = true;

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Ensure the word is non-empty and convert to uppercase
        const newWord = data[0] ? data[0].toUpperCase() : 'DEFAULT'; 
        if (newWord === 'DEFAULT') throw new Error('Received empty word from API');

        // 2. Reset and set game state
        secretWord = newWord;
        guessedLetters = [];
        remainingGuesses = MAX_GUESSES;
        gameActive = true;

        // 3. Update DOM elements
        wordDisplay.textContent = getDisplayWord();
        guessesLeftSpan.textContent = remainingGuesses;
        guessedLettersSpan.textContent = '';
        messageDisplay.textContent = 'Guess a letter to start!';
        messageDisplay.style.color = '';
        letterInput.value = '';

        // 4. Enable input
        guessButton.disabled = false;
        letterInput.disabled = false;
        letterInput.focus();
        
        // 5. Restore start button text
        startButton.textContent = 'Start New Game';
        startButton.disabled = false;
        
        console.log(`New word selected: ${secretWord}`);

    } catch (error) {
        console.error('Could not fetch a word:', error);
        messageDisplay.textContent = 'Error fetching a word. Try again.';
        startButton.textContent = 'Retry Game';
        startButton.disabled = false;
        gameActive = false;
    }
}


/**
 * Processes the player's letter guess.
 * NOTE: Language checks and Swedish letters (ÅÄÖ) are removed from validation.
 */
function handleGuess() {
    if (!gameActive) {
        messageDisplay.textContent = "Please click 'Start New Game'!";
        return;
    }

    let guess = letterInput.value.trim().toUpperCase();
    letterInput.value = ''; 
    letterInput.focus();

    // Input Validation (Simplified for English A-Z only)
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

// Removed: Language toggle button listener


// --- Initial Setup ---
// Call startGame to set up the game on page load
startGame();

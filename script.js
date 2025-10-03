// --- Step 1: Set Up Game Variables and DOM References ---
const MAX_GUESSES = 6;
const RANDOM_WORD_API_URL = 'https://random-word-api.herokuapp.com/word?number=1'; 
// We are requesting 1 random word from the API

let secretWord = '';
let guessedLetters = [];
let remainingGuesses = MAX_GUESSES;
let gameActive = false;

// DOM Element references (These stay the same)
const wordDisplay = document.getElementById('word-display');
const guessesLeftSpan = document.getElementById('guesses-left');
const guessedLettersSpan = document.getElementById('guessed-letters');
const letterInput = document.getElementById('letter-input');
const guessButton = document.getElementById('guess-button');
const messageDisplay = document.getElementById('message');
const startButton = document.getElementById('start-button');


// --- Core Functions (Helper and Logic are mostly unchanged) ---

/**
 * Updates the word display (e.g., changes 'C_D_' to 'C O D E').
 * @returns {string} The formatted display string.
 */
function getDisplayWord() {
    let display = '';
    for (const letter of secretWord) {
        // Check if the letter has been guessed
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


// --- Main Game Logic: NEW ASYNCHRONOUS START GAME FUNCTION ---

/**
 * Fetches a random word and initializes the game state.
 */
async function startGame() {
    // Disable the button temporarily and show a loading message
    startButton.textContent = 'Fetching Word...';
    startButton.disabled = true;

    try {
        // Use fetch to request a random word from the API
        const response = await fetch(RANDOM_WORD_API_URL);
        
        // Check if the network response was ok (status 200)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON response into a JavaScript object (an array containing the word)
        const data = await response.json();
        
        // The API returns an array like ['hello'], so we take the first element,
        // convert it to uppercase for consistency, and store it.
        const newWord = data[0].toUpperCase();

        // 1. Reset state
        secretWord = newWord;
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
        startButton.textContent = 'Start New Game';
        startButton.disabled = false;
        
        console.log(`New word selected: ${secretWord}`); // For testing!

    } catch (error) {
        console.error('Could not fetch a word:', error);
        messageDisplay.textContent = 'Error fetching a word. Please try again.';
        startButton.textContent = 'Retry Game';
        startButton.disabled = false;
        gameActive = false;
    }
}


/**
 * Processes the player's letter guess. (This remains the same)
 */
function handleGuess() {
    if (!gameActive) {
        messageDisplay.textContent = "Please click 'Start New Game'!";
        return;
    }

    let guess = letterInput.value.trim().toUpperCase();
    letterInput.value = ''; 
    letterInput.focus();

    if (!guess || guess.length !== 1 || !/^[A-Z]$/.test(guess)) {
        messageDisplay.textContent = 'Please enter a single letter (A-Z).';
        return;
    }

    if (guessedLetters.includes(guess)) {
        messageDisplay.textContent = `You already guessed the letter '${guess}'.`;
        return;
    }

    guessedLetters.push(guess);
    guessedLettersSpan.textContent = guessedLetters.join(', ');
    messageDisplay.textContent = ''; 

    if (secretWord.includes(guess)) {
        wordDisplay.textContent = getDisplayWord();
        messageDisplay.textContent = `Correct guess! '${guess}' is in the word.`;
    } else {
        remainingGuesses--;
        guessesLeftSpan.textContent = remainingGuesses;
        messageDisplay.textContent = `Incorrect guess! '${guess}' is not in the word.`;
    }

    checkGameStatus();
}

// --- Event Listeners (These remain the same) ---

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
// Call startGame to set up the game on page load
startGame();

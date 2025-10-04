// --- Step 1: Set Up Game Variables and DOM References ---
const MAX_GUESSES = 8;
const API_URL_ENGLISH = 'https://random-word-api.herokuapp.com/word?number=1';

// We'll keep the guess count at 8 for now, but you can change it to 20 later.

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

// 👇 NEW DOM REFERENCES FOR CUSTOM WORD FEATURE 👇
const customWordButton = document.getElementById('custom-word-button');
const customWordArea = document.getElementById('custom-word-area');
const customWordInput = document.getElementById('custom-word-input');
const setWordButton = document.getElementById('set-word-button');


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

/**
 * Common function to reset game state and update the display based on the current secretWord.
 */
function resetGameUI() {
    guessedLetters = [];
    remainingGuesses = MAX_GUESSES;
    gameActive = true;

    wordDisplay.textContent = getDisplayWord();
    guessesLeftSpan.textContent = remainingGuesses;
    guessedLettersSpan.textContent = '';
    messageDisplay.textContent = 'Guess a letter to start!';
    messageDisplay.style.color = '';
    letterInput.value = '';

    guessButton.disabled = false;
    letterInput.disabled = false;
    letterInput.focus();
    
    // Restore button states
    startButton.textContent = 'Start New Game (Random)';
    startButton.disabled = false;
    customWordButton.style.display = 'block';
}


/**
 * Fetches a random word from the English API and initializes the game state.
 * This is now used by the 'Start New Game (Random)' button.
 */
async function startGameWithRandomWord() {
    // Show loading state
    startButton.textContent = 'Fetching Word...';
    startButton.disabled = true;
    customWordButton.style.display = 'none'; // Hide custom button while fetching

    try {
        const response = await fetch(API_URL_ENGLISH);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Ensure the word is non-empty and convert to uppercase
        const newWord = data[0] ? data[0].toUpperCase() : 'DEFAULT'; 
        if (newWord === 'DEFAULT') throw new Error('Received empty word from API');

        secretWord = newWord;
        resetGameUI(); // Use common reset function
        console.log(`New word selected from API: ${secretWord}`);

    } catch (error) {
        console.error('Could not fetch a word:', error);
        messageDisplay.textContent = 'Error fetching a word. Try again.';
        startButton.textContent = 'Retry Game';
        startButton.disabled = false;
        customWordButton.style.display = 'block';
        gameActive = false;
    }
}


// 👇 NEW FUNCTION: Handles click of the 'Add Your Own Word' button 👇
function promptForCustomWord() {
    // Hide the start buttons
    startButton.style.display = 'none';
    customWordButton.style.display = 'none';

    // Show the custom input area
    customWordArea.style.display = 'block';
    
    // Set a specific message and focus the input
    messageDisplay.textContent = 'Enter a secret word for your friend to guess!';
    messageDisplay.style.color = 'blue';
    customWordInput.focus();

    // Disable guess functionality while word is being set
    guessButton.disabled = true;
    letterInput.disabled = true;
}


// 👇 NEW FUNCTION: Validates the custom word and starts the game 👇
function setCustomWordAndStart() {
    let word = customWordInput.value.trim().toUpperCase();

    // Validation Check: Requires at least 3 letters and only A-Z
    if (word.length < 3 || !/^[A-Z]+$/.test(word)) {
        messageDisplay.textContent = 'Please enter a word with at least 3 letters (A-Z only).';
        messageDisplay.style.color = '#dc3545';
        return;
    }
    
    // 1. Set the global secretWord variable
    secretWord = word;

    // 2. Hide the input area and restore the start buttons
    customWordArea.style.display = 'none';
    startButton.style.display = 'block';
    customWordButton.style.display = 'block';
    
    // Clear the input field for next time
    customWordInput.value = '';

    // 3. Start the game with the custom word
    resetGameUI(); 
    console.log(`Custom word set: ${secretWord}`);
}


/**
 * Processes the player's letter guess. (UNCHANGED)
 */
function handleGuess() {
    if (!gameActive) {
        messageDisplay.textContent = "Please click 'Start New Game' or set a custom word!";
        return;
    }

    let guess = letterInput.value.trim().toUpperCase();
    letterInput.value = ''; 
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

// 1. Start button now calls the random word fetch function
startButton.addEventListener('click', startGameWithRandomWord);

// 2. Custom Word button opens the input field
customWordButton.addEventListener('click', promptForCustomWord);

// 3. Set Word button starts the game with the custom word
setWordButton.addEventListener('click', setCustomWordAndStart);

// 4. Allow 'Enter' key press on the custom input field to submit
customWordInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        setCustomWordAndStart();
    }
});

// 5. Guess button
guessButton.addEventListener('click', handleGuess);

// 6. Allow 'Enter' key press on the guess input field to submit
letterInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleGuess();
    }
});


// --- Initial Setup ---
// Set up initial message, but don't start the game until a button is clicked.
// This prevents a random word fetch on page load.
function initialSetup() {
    messageDisplay.textContent = "Welcome! Click 'Start New Game (Random)' or 'Add Your Own Word'.";
    guessButton.disabled = true;
    letterInput.disabled = true;
    startButton.textContent = 'Start New Game (Random)';
}

initialSetup();

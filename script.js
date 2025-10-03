// --- Step 1: Set Up Game Variables and DOM References ---
const MAX_GUESSES = 6;
// Define the base URLs for English and Swedish
const API_URL_ENGLISH = 'https://random-word-api.herokuapp.com/word?number=1';
const API_URL_SWEDISH = 'https://random-word-api.herokuapp.com/word?lang=sv&number=1'; 

let secretWord = '';
let guessedLetters = [];
let remainingGuesses = MAX_GUESSES;
let gameActive = false;
let currentLanguage = 'EN'; // Tracks the current language ('EN' or 'SV')

// DOM Element references
const wordDisplay = document.getElementById('word-display');
const guessesLeftSpan = document.getElementById('guesses-left');
const guessedLettersSpan = document.getElementById('guessed-letters');
const letterInput = document.getElementById('letter-input');
const guessButton = document.getElementById('guess-button');
const messageDisplay = document.getElementById('message');
const startButton = document.getElementById('start-button');
const languageToggleButton = document.getElementById('language-toggle'); 


// --- Helper Functions ---

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
    
    // Check for Win: If there are no more underscores
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
        messageDisplay.textContent = (currentLanguage === 'EN') ? '🎉 YOU WON! 🎉' : '🎉 DU VANN! 🎉';
        messageDisplay.style.color = '#28a745';
    } else {
        const wordMessage = (currentLanguage === 'EN') ? `Game Over! The word was: ${secretWord}` : `Spelet slut! Ordet var: ${secretWord}`;
        messageDisplay.textContent = wordMessage;
        messageDisplay.style.color = '#dc3545';
        // Show the full word on loss
        wordDisplay.textContent = secretWord.split('').join(' ');
    }
}


// --- Main Game Logic Functions ---

/**
 * Toggles the game language between English and Swedish.
 */
function toggleLanguage() {
    if (currentLanguage === 'EN') {
        currentLanguage = 'SV';
        languageToggleButton.textContent = 'Switch to English 🇬🇧';
        messageDisplay.textContent = 'Spelet är nu på svenska! Klicka på "Starta nytt spel".';
    } else {
        currentLanguage = 'EN';
        languageToggleButton.textContent = 'Switch to Swedish 🇸🇪';
        messageDisplay.textContent = 'Game is now in English! Click "Start New Game".';
    }
    // Automatically start a new game with the new language
    startGame();
}

/**
 * Fetches a random word based on the currentLanguage and initializes the game state.
 */
async function startGame() {
    // 1. Determine the API URL based on the current language state
    const API_URL = (currentLanguage === 'EN') ? API_URL_ENGLISH : API_URL_SWEDISH;

    // Show loading state
    startButton.textContent = (currentLanguage === 'EN') ? 'Fetching Word...' : 'Hämtar ord...';
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
        messageDisplay.textContent = (currentLanguage === 'EN') ? 'Guess a letter to start!' : 'Gissa en bokstav för att starta!';
        messageDisplay.style.color = '';
        letterInput.value = '';

        // 4. Enable input
        guessButton.disabled = false;
        letterInput.disabled = false;
        letterInput.focus();
        
        // 5. Restore start button text
        startButton.textContent = (currentLanguage === 'EN') ? 'Start New Game' : 'Starta Nytt Spel';
        startButton.disabled = false;
        
        console.log(`New word selected in ${currentLanguage}: ${secretWord}`);

    } catch (error) {
        console.error('Could not fetch a word:', error);
        messageDisplay.textContent = (currentLanguage === 'EN') 
            ? 'Error fetching a word. Try again.' 
            : 'Fel vid hämtning av ord. Försök igen.';
        startButton.textContent = (currentLanguage === 'EN') ? 'Retry Game' : 'Försök Igen';
        startButton.disabled = false;
        gameActive = false;
    }
}


/**
 * Processes the player's letter guess.
 */
function handleGuess() {
    if (!gameActive) {
        messageDisplay.textContent = (currentLanguage === 'EN') 
            ? "Please click 'Start New Game'!" 
            : "Vänligen klicka på 'Starta Nytt Spel'!";
        return;
    }

    let guess = letterInput.value.trim().toUpperCase();
    letterInput.value = ''; 
    letterInput.focus();

    // Input Validation
    if (!guess || guess.length !== 1 || !/^[A-ZÅÄÖ]$/.test(guess)) { // Added Swedish letters ÅÄÖ to validation
        messageDisplay.textContent = (currentLanguage === 'EN') 
            ? 'Please enter a single letter (A-Z).' 
            : 'Vänligen ange en enda bokstav (A-Ö).';
        return;
    }

    // Check if letter was already guessed
    if (guessedLetters.includes(guess)) {
        messageDisplay.textContent = (currentLanguage === 'EN') 
            ? `You already guessed the letter '${guess}'.` 
            : `Du har redan gissat bokstaven '${guess}'.`;
        return;
    }

    // Add guess to history and update display
    guessedLetters.push(guess);
    guessedLettersSpan.textContent = guessedLetters.join(', ');
    messageDisplay.textContent = ''; // Clear previous message

    // Check if guess is correct
    if (secretWord.includes(guess)) {
        wordDisplay.textContent = getDisplayWord();
        messageDisplay.textContent = (currentLanguage === 'EN') 
            ? `Correct guess! '${guess}' is in the word.` 
            : `Rätt gissning! '${guess}' finns i ordet.`;
    } else {
        // Incorrect guess: Decrement guesses
        remainingGuesses--;
        guessesLeftSpan.textContent = remainingGuesses;
        messageDisplay.textContent = (currentLanguage === 'EN') 
            ? `Incorrect guess! '${guess}' is not in the word.` 
            : `Fel gissning! '${guess}' finns inte i ordet.`;
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

// 4. Language toggle button
languageToggleButton.addEventListener('click', toggleLanguage);


// --- Initial Setup ---
// Call startGame to set up the game on page load
startGame();

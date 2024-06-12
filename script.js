let secretWord = "apple"; // This is the secret word to guess
const difficultyButtons = document.getElementsByClassName("difficultyButton");
const guessInput = document.getElementById("guessInput");
const guessButton = document.getElementById("guessButton");
const letters = document.getElementsByClassName("letter");
const guesses = document.getElementById("guesses");
const feedback = document.getElementById("feedback");
const gameControls = [guessInput, guessButton, letters];
function resetLetters() {
    for (let i = 0; i < letters.length; i++) {
        letters[i].classList.remove("positive", "negative", "tried");
        letters[i].classList.add("default");
    }
};

function resetGuesses() {
    guesses.innerHTML = "";
};

function resetFeedback() {
    feedback.innerHTML = "";
};

function giveUp() {
    feedback.textContent = `You'll get it next time! The word was ${secretWord.toUpperCase()}!`;
    if(!guessButton.disabled) {
        flip(gameControls);
    }
}

async function resetGame() {
    resetLetters();
    resetGuesses();
    resetFeedback();
    setNewSecret();
    flip(gameControls);
};

function flip(stuff) {
    Array.from(stuff).forEach( thing => {
        if(thing instanceof HTMLCollection) {
            flip(thing);
        } else{
            thing.disabled = !thing.disabled;
        }
    });
};

async function setNewSecret() {
    let difficulty = document.getElementById("difficultySelection").querySelector(".selected").textContent.toLowerCase();
    fetchedWord = await fetchRandomWord(difficulty);
    if (secretWord) {
        // Initialize your game with the fetched word
        console.log(`The difficulty is set to ${difficulty}.`);
        // console.log(fetchedWord);
        secretWord = fetchedWord;
    } else {
        // Handle error or use a default word
    }
}

function setDifficulty(changeDifficultyEvent) {
    Array.from(difficultyButtons).forEach(el => el.classList.remove("selected"));
    changeDifficultyEvent.target.classList.add("selected");
    resetGame();
}

// function setDifficulty(difficulty) {

// }

function makeGuess() {
    const guess = guessInput.value.toLowerCase();

    if (guess.length !== 5) {
        feedback.textContent = "Please enter a 5-letter word.";
        return;
    }

    let correctLetters = 0;
    let correctPositions = 0;
    let secret = secretWord;

    for (let i = 0; i < 5; i++) {
        document.getElementById(guess[i]).classList.add('tried');

        if (guess[i] === secretWord[i]) {
            correctPositions++;
        }
        if (secret.includes(guess[i])) {
            correctLetters++;
            secret = secret.replace(guess[i], '');
        }
    }

    const guessResult = document.createElement("tr");
    guessResult.innerHTML = `
        <td>${guess.toUpperCase()}</td>
        <td>${correctLetters}</td>
        <td>${correctPositions}</td>
    `;
    guesses.insertBefore(guessResult, guesses.firstChild);

    if (guess === secretWord) {
        feedback.textContent = `Congratulations! You guessed it! It was ${secretWord.toUpperCase()}!`;
        flip(gameControls);
    } else {
        feedback.textContent = "Try again!";
    }

    guessInput.value = "";
    guessInput.focus();
}

async function fetchRandomWord(difficulty) {
    try {
        const response = await fetch(`${difficulty}-five`);
        if (response.ok) {
            const data = await response.text();
            const lines = data.split('\n'); // Split the content into lines
            const randomIndex = Math.floor(Math.random() * lines.length); // Pick a random index
            const randomWord = lines[randomIndex].trim(); // Get the random line/word
            return randomWord;
        } else {
            console.error('Failed to fetch the word:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching the word:', error);
    }
    return null; // Return null or a default word in case of failure
}

// Modify your makeGuess function or game initialization logic to use fetchRandomWord
async function startGame() {
    setNewSecret();
    // Add event listener to trigger makeGuess on 'Enter' key press
    document.getElementById("guessInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent the default action to avoid submitting the form
            makeGuess();
        }
    });

    //add event listener to cycle state of letters
    for (let i = 0; i < letters.length; i++) {
        letters[i].addEventListener("click", function(e) {
            // Select the clicked letter and cycle its class between [default, positive, negative]
            const letter = e.target;
            const states = ["default", "positive", "negative"];
            const state = states.find(className => letter.classList.contains(className));
            if (state === "default") {
                letter.classList.remove("default");
                letter.classList.add("positive");
            } else if (state === "positive") {
                letter.classList.remove("positive");
                letter.classList.add("negative");
            } else if (state === "negative") {
                letter.classList.remove("negative");
                letter.classList.add("default");
            }
        });
    }

    guessInput.addEventListener('input', function() {
        // Replace any character that is not a lowercase letter (a-z) with an empty string
        this.value = this.value.toLowerCase().replace(/[^a-z]/g, '');
    });

    Array.from(difficultyButtons).forEach(el => el.addEventListener("click", setDifficulty));
};

// Call startGame to begin a new game
startGame();

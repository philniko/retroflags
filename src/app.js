// Main Game Logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const flagImage = document.getElementById('flag-image');
  const nextFlagImage = document.getElementById('next-flag-image');
  const guessInput = document.getElementById('guess-input');
  const skipButton = document.getElementById('skip-button');
  const correctCount = document.getElementById('correct-count');
  const totalCount = document.getElementById('total-count');
  const timerDisplay = document.getElementById('timer-display');
  const nextFlagContainer = document.querySelector('.next-flag');
  
  // Game State
  let currentCountry = null;
  let nextCountry = null;
  let score = {
      correct: 0,
      total: 0
  };
  
  // Timer variables
  let startTime;
  let timerInterval;
  
  // Set the total count to the number of countries
  const TOTAL_COUNTRIES = 197;
  
  // Keep track of guessed countries to avoid repetition
  const guessedCountries = new Set();
  
  // Start the timer
  const startTimer = () => {
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
  };
  
  // Update the timer display
  const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Stop the timer
  const stopTimer = () => {
      clearInterval(timerInterval);
  };
  
  // Shuffle countries array for randomness
  const shuffleArray = (array) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
  };
  
  // Initialize game state
  let remainingCountries = [...countries];
  let shuffledCountries = shuffleArray(remainingCountries);
  let countryIndex = 0;
  
  // Show game completion message
  const showGameCompletion = () => {
      console.log("Showing game completion");
      
      // Stop the timer
      stopTimer();
      
      // Clear the flag images
      flagImage.src = '';
      nextFlagImage.src = '';
      
      // Disable input and update placeholder
      guessInput.disabled = true;
      guessInput.value = '';
      guessInput.placeholder = 'GAME COMPLETE!';
      
      // Hide the next flag container
      nextFlagContainer.style.visibility = 'hidden';
      
      // Make sure the skip button is disabled
      skipButton.disabled = true;
      
      console.log("Game completion setup finished");
  };
  
  // Get next country from the remaining countries
  const getNextCountry = () => {
      // If all countries have been guessed, return null
      if (guessedCountries.size >= TOTAL_COUNTRIES) {
          return null;
      }
      
      // If we've gone through all countries in current shuffle, reshuffle the remaining ones
      if (countryIndex >= shuffledCountries.length) {
          // Update the list of countries that haven't been guessed yet
          const notGuessedCountries = remainingCountries.filter(country => 
              !guessedCountries.has(country.code));
          
          // If no countries remain, the game is complete
          if (notGuessedCountries.length === 0) {
              return null;
          }
          
          shuffledCountries = shuffleArray(notGuessedCountries);
          countryIndex = 0;
      }
      
      const country = shuffledCountries[countryIndex];
      countryIndex++;
      
      return country;
  };
  
  // Load a new flag
  const loadNewFlag = () => {
      console.log("Loading new flag, current score:", score.correct);
      
      // First check if we've already completed the game
      if (score.correct >= TOTAL_COUNTRIES) {
          console.log("Score reached total, showing completion");
          showGameCompletion();
          return;
      }
      
      // Reset UI
      guessInput.value = '';
      
      // Get next country if not already set
      if (!nextCountry) {
          nextCountry = getNextCountry();
          console.log("Got next country:", nextCountry?.name);
      }
      
      // Current becomes next, and we get a new next
      currentCountry = nextCountry;
      nextCountry = getNextCountry();
      console.log("Current country:", currentCountry?.name);
      console.log("Next country:", nextCountry?.name);
      
      // Check if there are any countries left to guess
      if (!currentCountry) {
          console.log("No current country, showing completion");
          showGameCompletion();
          return;
      }
      
      // Update the flag images
      flagImage.src = `https://flagcdn.com/w320/${currentCountry.code}.png`;
      
      // Handle the next flag display
      if (nextCountry) {
          // Check if this is the last flag (next will be null after this one)
          if (score.correct === TOTAL_COUNTRIES - 1) {
              console.log("On the last flag, hiding next preview");
              nextFlagContainer.style.visibility = 'hidden';
              nextFlagImage.src = '';
          } else {
              nextFlagImage.src = `https://flagcdn.com/w160/${nextCountry.code}.png`;
              nextFlagContainer.style.visibility = 'visible';
          }
      } else {
          console.log("No next country, hiding next preview");
          nextFlagImage.src = '';
          nextFlagContainer.style.visibility = 'hidden';
      }
      
      // Focus on input
      guessInput.focus();
  };
  
  // Check user's guess
  const checkGuess = () => {
      const userGuess = guessInput.value.trim().toLowerCase();
      
      if (userGuess === '' || !currentCountry) return;
      
      // Check if guess is correct (case insensitive)
      if (userGuess === currentCountry.name.toLowerCase() || 
          getAlternateNames(currentCountry.name).includes(userGuess)) {
          // Correct guess - add to guessed set
          guessedCountries.add(currentCountry.code);
          
          // Remove from remaining countries
          remainingCountries = remainingCountries.filter(country => 
              country.code !== currentCountry.code);
          
          // Update score
          score.correct++;
          correctCount.textContent = score.correct;
          
          // Check if this was the last country
          if (score.correct >= TOTAL_COUNTRIES) {
              showGameCompletion();
              return;
          }
          
          // Immediately load next flag
          loadNewFlag();
      }
  };
  
  // Skip current flag
  const skipFlag = () => {
      if (!currentCountry) return;
      loadNewFlag();
  };
  

  
  // Get alternate acceptable names for countries
  const getAlternateNames = (countryName) => {
      const alternates = {
          "United States": ["usa", "america", "united states of america"],
          "United Kingdom": ["uk", "britain", "great britain"],
          "Democratic Republic of the Congo": ["drc", "dr congo"],
          "Ivory Coast": ["cote d'ivoire"],
          "Russia": ["russian federation"],
          "North Macedonia": ["macedonia"],
          "Vatican City": ["holy see", "vatican"],
          "Czech Republic": ["czechia"],
          "Eswatini": ["swaziland"],
          "Timor-Leste": ["east timor", "timor"],
          "Saint Vincent and the Grenadines": ["saint vincent", "st vincent", "st. vincent"],
          // Add more alternates as needed
      };
      
      return alternates[countryName] 
          ? [...alternates[countryName], countryName.toLowerCase()]
          : [countryName.toLowerCase()];
  };
  
  // Event Listeners
  guessInput.addEventListener('input', () => {
      checkGuess();
  });
  
  skipButton.addEventListener('click', () => {
      skipFlag();
  });
  
  // Initialize the game
  correctCount.textContent = "0";
  totalCount.textContent = TOTAL_COUNTRIES.toString();
  loadNewFlag();
  startTimer();
});
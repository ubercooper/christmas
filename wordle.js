let dictionary = {};
let targets = ["YXBwbGU=", "Z3JhcGU=", "cGVhY2g=", "bWVsb24=", "bGVtb24="]; // Predefined target words
let targetWord = "";
let currentRow = 0;
let currentCol = 0;
let guesses = Array(6).fill("").map(() => Array(5).fill(""));
let feedback = Array(6).fill("").map(() => Array(5).fill("")); // Store feedback for each guess

// Load the external dictionary
async function loadDictionary(clue) {
  try {
    const response = await fetch("words_dictionary.json");
    dictionary = await response.json();
    targetWord = atob(targets[clue]);
    console.log(`Target Word (for debugging): ${targetWord}`);
  } catch (error) {
    console.error("Failed to load the dictionary:", error);
  }
}

function renderGrid() {
  grid.innerHTML = ""; // Clear the previous grid

  for (let row = 0; row < 6; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    for (let col = 0; col < 5; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = guesses[row][col];

      // Apply the feedback colors
      if (feedback[row][col] === "correct") {
        cell.classList.add("correct");
      } else if (feedback[row][col] === "present") {
        cell.classList.add("present");
      } else if (feedback[row][col] === "absent") {
        cell.classList.add("absent");
      }

      // If it's the active row, apply the active style to the cell itself
      if (row === currentRow) {
        cell.classList.add("active-cell");
      }

      rowDiv.appendChild(cell); // Add each cell to the row
    }

    grid.appendChild(rowDiv); // Add the row to the grid
  }
}



// Handle keypress input
function handleKeyPress(event) {
  const key = event.key.toLowerCase();

  // Handle backspace
  if (key === "backspace" && currentCol > 0) {
    currentCol--;
    guesses[currentRow][currentCol] = "";
    renderGrid();
    return;
  } else if (key === "backspace") {
    return;
  }

  // Check for alphabet letters
  if (/^[a-zA-Z]$/.test(key) && currentCol < 5) {
    guesses[currentRow][currentCol] = key;
    currentCol++;
    renderGrid();
  }

  // Handle Enter key
  if (key === "enter" && currentCol === 5) {
    const guess = guesses[currentRow].join("").toLowerCase();
    if (!dictionary[guess]) {
      alert("Invalid word!");
      return;
    }

    // Check and color the guess
    const targetChars = targetWord.split("");
    const usedIndexes = new Set();
    const rowFeedback = Array(5).fill("absent");

    // Check correct positions
    for (let i = 0; i < 5; i++) {
      if (guesses[currentRow][i] === targetChars[i]) {
        rowFeedback[i] = "correct";
        usedIndexes.add(i);
      }
    }

    // Check misplaced letters
    for (let i = 0; i < 5; i++) {
      if (rowFeedback[i] !== "correct" && targetChars.includes(guesses[currentRow][i])) {
        for (let j = 0; j < 5; j++) {
          if (
            !usedIndexes.has(j) &&
            guesses[currentRow][i] === targetChars[j]
          ) {
            rowFeedback[i] = "present";
            usedIndexes.add(j);
            break;
          }
        }
      }
    }

    // Store the feedback for the current row
    feedback[currentRow] = rowFeedback;

    if (guess === targetWord) {
      alert("The clue iis ${targetWord}");
    } else if (currentRow === 5) {
      alert(`Try Again!`);
      location.reload();
    }

    currentRow++;
    currentCol = 0;
    renderGrid();
  }
}

// Initialize game
const urlParams = new URLSearchParams(window.location.search);
const clue = urlParams.get('clue');
renderGrid();
document.addEventListener("keydown", handleKeyPress);
loadDictionary(clue);

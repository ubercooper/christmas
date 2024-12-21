let dictionary = {};
let targets = ["Y3luaWM=", "aGVhcnQ=", "Z3JlZW4="]; // Predefined target words
let targetWord = "";
let currentRow = 0;
let currentCol = 0;
let guesses = Array(6).fill("").map(() => Array(5).fill(""));
let feedback = Array(6).fill("").map(() => Array(5).fill(""));

// Load the external dictionary
async function loadDictionary(clue) {
  try {
    const response = await fetch("words_dictionary.json");
    dictionary = await response.json();
    targetWord = atob(targets[clue-1]);
  } catch (error) {
    console.error("Failed to load the dictionary:", error);
  }
}

function showAlert(message) {
  const alertBox = document.getElementById('customAlert');
  const alertMessage = document.getElementById('alertMessage');
  alertMessage.textContent = message;
  alertBox.classList.remove('hidden');
}

// Function to close the alert
function closeAlert() {
  const alertBox = document.getElementById('customAlert');
  alertBox.classList.add('hidden');
}

function renderGrid() {
  grid.innerHTML = ""; // Clear the previous grid

  for (let row = 0; row < 5; row++) {
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
        document.getElementById(guesses[row][col]).classList.add("absent");
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

// Handle key press
function handleKeyClick(key) {
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
  showAlert("Word not in the dictionary.");
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
  showAlert('The clue is: ' + targetWord+'!');
} else if (currentRow === 5) {
  showAlert(`Try Again!`);
  location.reload();
}

currentRow++;
currentCol = 0;
renderGrid();
}
}



// Handle keypress input
function handleKeyPress(event) {
  const key = event.key.toLowerCase();
  handleKeyClick(key);
}

document.addEventListener("DOMContentLoaded", function () {
  const keyboardLayout = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"]
  ];

const specialKeys = ["backspace", "enter"];

  const textInput = document.getElementById("textInput");
  const keyboard = document.getElementById("keyboard");

  // Render the keyboard
  function renderKeyboard() {
      keyboard.innerHTML = ""; // Clear existing buttons
      keyboard.innerHTML = ""; // Clear existing keys

        // Create rows for regular keys
        keyboardLayout.forEach(rowKeys => {
            const row = document.createElement("div");
            row.className = "row";
            rowKeys.forEach(key => {
                const button = createKeyButton(key);
                button.id = key;
                row.appendChild(button);
            });
            keyboard.appendChild(row);
        });

        // Create a row for special keys
        const specialRow = document.createElement("div");
        specialRow.className = "row special-keys";
        specialKeys.forEach(key => {
            const button = createKeyButton(key);
            specialRow.appendChild(button);
        });
        keyboard.appendChild(specialRow);


  }

  // Create a button for a key
  function createKeyButton(key) {
    const button = document.createElement("button");
    button.textContent = key === "Space" ? "␣" : key;
    button.className = key === "Space" ? "space" : "";

    // Add button click event
    button.addEventListener("click", () => handleKeyClick(key));
    return button;
}
  renderKeyboard(); // Initialize keyboard
});

// Initialize game
const urlParams = new URLSearchParams(window.location.search);
const clue = urlParams.get('clue');
renderGrid();
document.addEventListener("keydown", handleKeyPress);
loadDictionary(clue);

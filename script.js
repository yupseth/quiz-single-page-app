"use strict";

// SELECTIONS
const startScreen = document.querySelector(".start-screen");
const dropdown = document.querySelector("select");
const startButton = document.querySelector(".button-start");
const difficultyRadioButtons = document.getElementsByName("difficulty");
const footer = document.querySelector("footer");

const loadingScreen = document.querySelector(".loading-screen");

const playScreen = document.querySelector(".play-screen");
const questionArea = document.querySelector(".question-area");
const currentScore = document.querySelector(".score");
const buttonGrid = document.querySelector(".button-grid");
const nextButton = document.querySelector(".next-button");
const resetButtonWrapper = document.querySelector(".reset-wrapper");

const resetPlayScreen = document.querySelector(".reset-playscreen");
const questionCounterPlay = document.querySelector(".question-counter");

const errorScreen = document.querySelector(".error-screen");
const errorMessage = document.querySelector(".error-message");

const endScreen = document.querySelector(".end-screen");
const result = document.querySelector(".result");
const finalScore = document.querySelector(".final-score");
const resetButton = document.querySelector(".reset-button");

// GLOBAL DECLARATIONS
let categories = [];
let answers = [];
let selectedCategory;
let selectedDifficulty;
let apiData;
let apiDataResults;
let questionCounter = 0;
let score = 0;
let questionLimit = 10;
let extraLoadingTime = 1500;

nextButton.disabled = true;

const stateHidePairs = [
  {
    state: "start",
    hideMethod: hideStartScreen,
  },
  {
    state: "loading",
    hideMethod: hideLoadingScreen,
  },
  {
    state: "playing",
    hideMethod: hidePlayScreen,
  },
  {
    state: "error",
    hideMethod: hideErrorScreen,
  },
  {
    state: "end",
    hideMethod: hideEndScreen,
  },
];

const setState = function (state) {
  switch (state) {
    case "start":
      displayStartScreen();
      break;

    case "loading":
      displayLoadingScreen();
      break;

    case "playing":
      showNextQuestion();
      displayPlayScreen();
      updateScore();
      break;

    case "error":
      displayErrorScreen();
      break;

    case "end":
      displayEndScreen();
      break;
  }
};

const init = function () {
  score = 0;
  questionCounter = 0;
  nextButton.disabled = true;
};

const hideOtherThan = (currentState) => {
  stateHidePairs.forEach((pair) => {
    if (pair.state !== currentState) pair.hideMethod();
  });
};

// DISPLAY / HIDE SCREENS
const displayStartScreen = function () {
  hideOtherThan("start");
  startScreen.classList.remove("hidden");
  init();
  footer.classList.remove("hidden");
};

function hideStartScreen() {
  startScreen.classList.add("hidden");
  footer.classList.add("hidden");
}
/////////////////////////////////
const displayLoadingScreen = function () {
  loadingScreen.classList.remove("hidden");
  hideOtherThan("loading");
};

function hideLoadingScreen() {
  loadingScreen.classList.add("hidden");
}
/////////////////////////////////
const displayPlayScreen = function () {
  hideOtherThan("playing");
  playScreen.classList.remove("hidden");
  updateQuestionCounterDisplay();
};

function hidePlayScreen() {
  playScreen.classList.add("hidden");
  resetButtonWrapper.classList.add("hidden");
}
/////////////////////////////////
const displayErrorScreen = function () {
  hideOtherThan("error");

  errorScreen.classList.remove("hidden");

  resetButtonWrapper.classList.remove("hidden");
  resetButtonWrapper.classList.add("end");
  resetButton.classList.add("end");
};

function hideErrorScreen() {
  errorScreen.classList.add("hidden");
}

/////////////////////////////////
const displayEndScreen = function () {
  hideOtherThan("end");
  endScreen.classList.remove("hidden");
  resetButtonWrapper.classList.remove("hidden");
  // add endScreen styling to reset button
  resetButtonWrapper.classList.add("end");
  resetButton.classList.add("end");
  finalScore.textContent = `Your Score: ${score}`;
};

function hideEndScreen() {
  endScreen.classList.add("hidden");
  resetButton.classList.remove("end");
  resetButtonWrapper.classList.add("hidden");
  resetButtonWrapper.classList.remove("end");
}
/////////////////////////////////

//fisher yates true random
const shuffleAnswers = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

//decode special characters in QnA
const decodeHTMLEntities = function (text) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  return textArea.value;
};

// highlight correct answers
const highlightCorrectAnswer = function () {
  for (const button of buttonGrid.children) {
    if (
      button.textContent ===
      decodeHTMLEntities(apiDataResults[questionCounter].correct_answer)
    ) {
      button.classList.add("correct-answer");
    }
  }
};

const disableAnswerButtons = function () {
  for (const button of buttonGrid.children) {
    button.disabled = true;
  }
  nextButton.disabled = false;
};

const updateScore = function () {
  currentScore.textContent = `Score: ${score}`;
};

const updateQuestionCounterDisplay = function () {
  questionCounterPlay.textContent = `${questionCounter + 1}/${questionLimit}`;
};

//////////////////////////////////////////////
// CATEGORY DROPDOWN

const getCategories = function () {
  setState("loading");
  setTimeout(() => {
    fetch("https://opentdb.com/api_category.php")
      .then((response) => response.json())
      .then((data) => {
        categories = [...data.trivia_categories];
        categories.forEach((category) => {
          const dropdownOption = document.createElement("option");
          dropdownOption.textContent = category.name;
          dropdownOption.value = category.id;
          dropdown.appendChild(dropdownOption);
        });
      })
      .finally(() => {
        setState("start");
      });
  }, extraLoadingTime);
};

getCategories();

// READ CATEGORY AND DIFFICULTY
const readSelectedCategory = () => {
  for (const option of dropdown.options) {
    if (option.selected) {
      selectedCategory = option.value;
    }
  }
};

const readSelectedDifficulty = () => {
  for (const element of difficultyRadioButtons) {
    if (element.checked) {
      selectedDifficulty = element.value;
    }
  }
};

// GET API DATA
const getQuestions = () => {
  setState("loading");
  setTimeout(() => {
    let url = new URL(
      `https://opentdb.com/api.php?amount=${questionLimit}&category=${selectedCategory}&difficulty=${selectedDifficulty}&type=multiple`
    );
    fetch(url.href)
      .then((response) => response.json())
      .then((data) => {
        apiData = data;
        apiDataResults = apiData.results;
        // showNextQuestion();
      })
      .finally(() => {
        //test for error response_code
        const appropriateState =
          apiData.response_code > 0 ? "error" : "playing";
        setState(appropriateState);
      });
  }, extraLoadingTime);
};

// DISPLAY QUESTIONS AND ANSWERS
const showNextQuestion = function () {
  questionArea.textContent = decodeHTMLEntities(
    apiDataResults[questionCounter].question
  );

  answers = [
    ...apiDataResults[questionCounter].incorrect_answers,
    apiDataResults[questionCounter].correct_answer,
  ];

  answers = answers.map((answer) => decodeHTMLEntities(answer));
  showAnswers();
};

const showAnswers = function () {
  shuffleAnswers(answers);
  buttonGrid.innerHTML = "";
  answers.forEach((elem) => {
    // 1. Create answer buttons for current question
    const answerButton = document.createElement("button");
    answerButton.classList.add("answer-button");
    buttonGrid.appendChild(answerButton);
    answerButton.textContent = elem;
    // 2. Answer buttons functionality
    answerButton.addEventListener("click", () => {
      if (
        answerButton.textContent ===
        decodeHTMLEntities(apiDataResults[questionCounter].correct_answer)
      ) {
        score++;
        answerButton.classList.add("correct-answer");
      } else {
        answerButton.classList.add("incorrect-answer");
      }
      updateScore();
      disableAnswerButtons();
      highlightCorrectAnswer();
    });
  });
};

// EVENTS
startButton.addEventListener("click", () => {
  readSelectedCategory();
  readSelectedDifficulty();
  getQuestions();
});

nextButton.addEventListener("click", () => {
  questionCounter++;
  updateQuestionCounterDisplay();
  nextButton.disabled = true;

  if (questionCounter < questionLimit) {
    showNextQuestion();
  } else {
    setState("end");
  }
});
resetPlayScreen.addEventListener("click", () => {
  setState("start");
});

resetButton.addEventListener("click", () => {
  setState("start");
});

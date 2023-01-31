"use strict";

// SELECTIONS
const startScreen = document.querySelector(".start-screen");
const dropdown = document.querySelector("select");
const startButton = document.querySelector(".button-start");
const resetButtonWrapper = document.querySelector(".reset-wrapper");
const difficultyRadioButtons = document.getElementsByName("difficulty");

const playScreen = document.querySelector(".play-screen");
const questionArea = document.querySelector(".question-area");
const currentScore = document.querySelector(".score");
const buttonGrid = document.querySelector(".button-grid");
const nextButton = document.querySelector(".next-button");

const endScreen = document.querySelector(".end-screen");
const result = document.querySelector(".result");
const finalScore = document.querySelector(".final-score");
const resetButton = document.querySelector(".reset-button");

// GLOBAL DECLARATIONS
let categories = [];
let answers = [];
let isLoading = false;
let selectedCategory;
let selectedDifficulty;
let apiData;
let apiDataResults;
let questionCounter = 0;
let score = 0;
let questionLimit = 2;

let state = "start";
nextButton.disabled = true;

const setState = function () {
  switch (state) {
    case "start":
      displayStartScreen();
      break;

    case "playing":
      displayPlayScreen();
      updateScore();
      readSelectedCategory();
      readSelectedDifficulty();
      getQuestions();
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

// REFACTOR ideas: init, states

const resetGame = function () {
  hidePlayScreen();
  hideEndScreen();
  displayStartScreen();
  init();
};

// HELPERS

const displayStartScreen = function () {
  hidePlayScreen();
  hideEndScreen();
  startScreen.classList.remove("hidden");
  init();
};

const hideStartScreen = function () {
  startScreen.classList.add("hidden");
};

const displayPlayScreen = function () {
  hideStartScreen();
  hideEndScreen();
  playScreen.classList.remove("hidden");
  resetButtonWrapper.classList.remove("hidden");
};

// hide play screen
const hidePlayScreen = function () {
  playScreen.classList.add("hidden");
  resetButtonWrapper.classList.add("hidden");
};

// display end screen
const displayEndScreen = function () {
  hideStartScreen();
  hidePlayScreen();
  endScreen.classList.remove("hidden");
  resetButtonWrapper.classList.remove("hidden");
  // add endScreen styling to reset button
  resetButtonWrapper.classList.add("end");
  resetButton.classList.add("end");
  finalScore.textContent = `Your Score: ${score}`;
};

const hideEndScreen = function () {
  endScreen.classList.add("hidden");
  resetButtonWrapper.classList.remove("end");
  resetButton.classList.remove("end");
  resetButtonWrapper.classList.add("hidden");
};

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
    if (button.textContent === apiDataResults[questionCounter].correct_answer) {
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

//////////////////////////////////////////////
// CATEGORY DROPDOWN
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
  });

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
  isLoading = true;
  let url = new URL(
    `https://opentdb.com/api.php?amount=10&category=${selectedCategory}&difficulty=${selectedDifficulty}&type=multiple`
  );
  fetch(url.href)
    .then((response) => response.json())
    .then((data) => {
      apiData = data;
      apiDataResults = apiData.results;
      showNextQuestion();
    })
    .finally(() => {
      isLoading = false;
    });
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
        apiDataResults[questionCounter].correct_answer
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
  state = "playing";
  setState();
});

nextButton.addEventListener("click", () => {
  questionCounter++;
  nextButton.disabled = true;

  if (questionCounter < questionLimit) {
    showNextQuestion();
  } else {
    state = "end";
    setState();
  }
});

resetButton.addEventListener("click", () => {
  state = "start";
  setState();
});

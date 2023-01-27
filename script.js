"use strict";

// SELECTIONS
const content = document.querySelector(".content");
const dropdown = document.querySelector("select");
const startButton = document.querySelector(".button-start");
const resetButton = document.querySelector(".reset-wrapper");
const difficultyRadioButtons = document.getElementsByName("difficulty");

const playScreen = document.querySelector(".play-screen");
const questionArea = document.querySelector(".question-area");
const currentScore = document.querySelector(".score");
const buttonGrid = document.querySelector(".button-grid");
const nextButton = document.querySelector(".next-button");

const endScreen = document.querySelector(".end-screen");
const result = document.querySelector(".result");
const finalScore = document.querySelector(".final-score");

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

nextButton.disabled = true;

// HELPERS
const toggleHidden = function () {
  content.classList.add("hidden");
  playScreen.classList.remove("hidden");
  resetButton.classList.remove("hidden");
};

// hide play screen
const hidePlayScreen = function () {
  playScreen.classList.add("hidden");
  nextButton.classList.add("hidden");
};

// display end screen
const displayEndScreen = function () {
  endScreen.classList.remove("hidden");
  finalScore.textContent = `Your Score: ${score}`;
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
  fetch(
    `https://opentdb.com/api.php?amount=10&category=${selectedCategory}&difficulty=${selectedDifficulty}&type=multiple`
  )
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
  updateScore();
  toggleHidden();
  readSelectedCategory();
  readSelectedDifficulty();
  getQuestions();
});

nextButton.addEventListener("click", () => {
  questionCounter++;

  if (questionCounter < 3) {
    showNextQuestion();
    nextButton.disabled = true;
  } else {
    hidePlayScreen();
    displayEndScreen();
    nextButton.disabled = true;
  }
});

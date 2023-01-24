"use strict";

// SELECTIONS
const content = document.querySelector(".content");
const dropdown = document.querySelector("select");
const startButton = document.querySelector(".button-start");
const resetButton = document.querySelector(".reset-wrapper");
const playScreen = document.querySelector(".play-screen");
const difficultyRadioButtons = document.getElementsByName("difficulty");

// GLOBAL DECLARATIONS
let categories = [];
let isLoading = false;
let selectedCategory;
let selectedDifficulty;
let apiData;
let apiDataResults;

// HELPERS
const toggleHidden = function () {
  content.classList.add("hidden");
  playScreen.classList.remove("hidden");
  resetButton.classList.remove("hidden");
};

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
      console.log(apiDataResults);
    })
    .finally(() => {
      isLoading = false;
    });
};

// EVENTS
startButton.addEventListener("click", () => {
  toggleHidden();
  readSelectedCategory();
  readSelectedDifficulty();
  getQuestions();
});

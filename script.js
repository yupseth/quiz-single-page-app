"use strict";

// SELECTIONS
const content = document.querySelector(".content");
const dropdown = document.querySelector("select");
const startButton = document.querySelector(".button-start");

// GLOBAL DECLARATIONS
let categories = [];

// HELPERS
const toggleHidden = function () {
  content.classList.add("hidden");
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

startButton.addEventListener("click", () => {
  toggleHidden();
});

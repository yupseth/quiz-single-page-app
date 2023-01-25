"use strict";
// SELECTIONS
const content = document.querySelector(".content");
const dropdown = document.querySelector("select");

// GLOBAL DECLARATIONS
let categories = [];

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

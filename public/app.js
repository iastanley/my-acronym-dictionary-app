const MOCK_ACRONYM_DATA = [
    {
      "id": "1",
      "user": "sam",
      "acronym": "LOL",
      "spellOut": "Laughing Out Loud",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "categoryId": "10"
    },
    {
      "id": "2",
      "user": "sam",
      "acronym": "FOMO",
      "spellOut": "Fear Of Missing Out",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "categoryId": "10"
    },
    {
      "id": "3",
      "user": "sam",
      "acronym": "TTYL",
      "spellOut": "Talk To You Later",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "categoryId": "10"
    },
    {
      "id": "4",
      "user": "sam",
      "acronym": "JSON",
      "spellOut": "JavaScript Object Notation",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "categoryId": "20"
    },
    {
      "id": "5",
      "user": "sam",
      "acronym": "PLC",
      "spellOut": "Programmable Logic Controller",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "categoryId": "20"
    },
    {
      "id": "6",
      "user": "sam",
      "acronym": "PLC",
      "spellOut": "Phospholipase C",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "categoryId": "30"
    },
    {
      "id": "7",
      "user": "sam",
      "acronym": "MAPK",
      "spellOut": "Mitogen Activated Protein Kinase",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "categoryId": "30"
    },
    {
      "id": "8",
      "user": "sam",
      "acronym": "DRY",
      "spellOut": "Don't Repeat Yourself",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "categoryId": "20"
    }
  ];

const MOCK_CATEGORY_LIST =
  [
    {
      "id": "10",
      "title": "Casual",
      "color": "#ff00ff"
    },
    {
      "id": "20",
      "title": "Programming",
      "color": "#00ffff"
    },
    {
      "id": "30",
      "title": "Biology",
      "color": "#ffff00"
    }
  ];

let categories = [];

//fake ajax call to get data
function getAcronymData(callback) {
  // (function(){callback(MOCK_DATA)})();
  setTimeout(function(){callback(MOCK_ACRONYM_DATA)}, 100);
}

function getCategoryData() {
  categories = MOCK_CATEGORY_LIST;
}

function getCategoryDataById(id) {
  return categories.find(category => category.id === id);
}

//display categories in sidebar
function displayCategories(data) {
  let html =`<h3 class="text-center">Categories</h3>
            <div class="panel panel-default category" id="all-categories">
              <div class="panel-body">
                All Categories
              </div>
            </div>`;
  categories.forEach(category => {
    html +=
      `<div class="panel panel-default category" id="${category.id}" style="background-color:${category.color}">
        <div class="panel-body">
        ${category.title}
        </div>
      </div>`;
  });
  $('#categories').html(html);
}

//display acronym entries in main search area
function displayAcronymEntries(data) {
  let html = '';
  data.forEach(acronym => {
    let color = getCategoryDataById(acronym.categoryId).color;
    html +=
      `<div class="col-lg-6">
        <div class="panel panel-default">
          <div class="panel-heading" style="background-color:${color}">
            <h3 class="panel-title">${acronym.acronym}</h3>
          </div>
          <div class="panel-body">
            <h4>${acronym.spellOut}</h4>
            <p>${acronym.definition || ''}</p>
            <p>Category: ${acronym.category}</p>
          </div>
        </div>
      </div>`
  });
  $('#acronym-entries').html(html);
}

function displayAcronymEntriesByCategory(categoryId) {
  return function(data) {
    let filteredData = data.filter(item => {
      return item.categoryId == categoryId;
    });
    displayAcronymEntries(filteredData);
  }
}

function searchAcronyms(searchTerm) {
  return function(data) {
    let regex = new RegExp(`(${searchTerm})`, 'g');
    let searchResults = data.filter(item => {
      //return true if searchTerm is found in item.acronym or in item.spellOut
      return regex.test(item.acronym) || regex.test(item.spellOut);
    });
    displayAcronymEntries(searchResults);

  }
}

//search acronyms
function addSearchListener() {
  $('#search-form').on('submit', function(event) {
    event.preventDefault();
    let search = $('#search-input').val();
    //get acronym data and search through it
    getAcronymData(searchAcronyms(search));
    //clear value
    $('#search-input').val('');
  });
}

//filter acronyms by category
function addCategoryListener() {
  $('#categories').on('click', '.category', function() {
    if ($(this).attr('id') == 'all-categories') {
      getAcronymData(displayAcronymEntries);
    } else {
      const categoryId = $(this).attr('id');
      getAcronymData(displayAcronymEntriesByCategory(categoryId));
    }

  });
}

$(function() {
  getCategoryData();
  displayCategories(categories);
  getAcronymData(displayAcronymEntries);
  addSearchListener();
  addCategoryListener();
});
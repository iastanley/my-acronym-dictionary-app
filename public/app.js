const BASE_URL = 'http://localhost:8080/';
// const BASE_URL = 'https://my-acronym-dictionary.herokuapp.com/'

let categories = [];

//optional search or category Id parameters
function getAcronymData(callback, {search='', categoryId=''}={}) {
  const settings = {
    url: BASE_URL + 'acronyms',
    data: {
      searchQuery: search,
      categoryQuery: categoryId
    },
    success: callback
  }
  $.getJSON(settings);
}

function getCategoryData(callback, {categoryTitle='', categoryId=''}={}) {
  const settings = {
    url: BASE_URL + 'categories',
    data: {
      title: categoryTitle,
      id: categoryId
    },
    success: callback
  }
  $.getJSON(settings);
}

function getCategoryDataById(id) {
  return categories.find(category => category.id === id);
}

//display categories in sidebar
function displayCategories(categoryData) {
  storeLocalCategories(categoryData);
  let html =`<h3 class="text-center">Categories</h3>
            <div class="panel panel-default category" id="all-categories">
              <div class="panel-body">
                <h3 class="panel-title">All Categories</h3>
              </div>
            </div>`;
  categoryData.forEach(category => {
    html +=
      `<div class="panel panel-default category" id="${category.id}" style="background-color:${category.color}">
        <div class="panel-body">
          <h3 class="panel-title">${category.title}</h3>
          <div class="dropdown">
            <button class="option-btn dropdown-toggle" type="button" id="optionFor${category.id}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span class="glyphicon glyphicon-option-vertical">
              </span>
            </button>
            <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="optionFor${category.id}">
              <li><a href="#" class="deleteLink">Delete</a></li>
            </ul>
          </div>
        </div>
      </div>`;
  });
  $('#category-list').html(html);
}

function storeLocalCategories(categoryData) {
  categories = categoryData;
}

//display acronym entries in main search area
function displayAcronymEntries(data) {
  let html = '';
  data.forEach(acronym => {
    let {title, color} = getCategoryDataById(acronym.categoryId);

    html +=
      `<div class="col-lg-6">
        <div class="panel panel-default">
          <div class="panel-heading clearfix" style="background-color:${color}">
            <h3 class="panel-title">${acronym.acronym}</h3>
            <div class="dropdown">
              <button class="option-btn dropdown-toggle" type="button" id="optionFor${acronym.id}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="glyphicon glyphicon-option-vertical">
                </span>
              </button>
              <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="optionFor${acronym.id}">
                <li><a href="#" class="updateLink">Update</a></li>
                <li><a href="#" class="deleteLink">Delete</a></li>
              </ul>
            </div>
          </div>
          <div class="panel-body">
            <h4>${acronym.spellOut}</h4>
            <p>${acronym.definition || ''}</p>
            <p>Category: ${title}</p>
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
    let regex = new RegExp(`(${searchTerm})`, 'i');
    let searchResults = data.filter(item => {
      return (regex.test(item.acronym) || regex.test(item.spellOut));
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
  $('#category-list').on('click', '.category', function() {
    if ($(this).attr('id') == 'all-categories') {
      getAcronymData(displayAcronymEntries);
    } else {
      const categoryId = $(this).attr('id');
      getAcronymData(displayAcronymEntriesByCategory(categoryId));
    }

  });
}

//add listener for add new entries
function newEntryListener() {
  $('#new-entry-form').on('submit', function(event) {
    // event.preventDefault();
    let formInput = {
      acronym: $('#acronym-input').val(),
      spellOut: $('#spell-out-input').val(),
      definition: $('#definition-input').val() || '',
      categoryTitle: $('#category-input').val()
    }

    $.ajax({
      type: 'POST',
      url: BASE_URL + 'acronyms',
      processData: false,
      contentType: 'application/json',
      data: JSON.stringify(formInput),
    });

  });
}

$(function() {
  getCategoryData(displayCategories);
  getAcronymData(displayAcronymEntries);
  addSearchListener();
  addCategoryListener();
  newEntryListener();
});

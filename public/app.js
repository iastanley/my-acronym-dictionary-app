// const BASE_URL = 'http://localhost:8080/';
const BASE_URL = 'https://my-acronym-dictionary.herokuapp.com/'

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
  let html = '';
  if (categoryData.length) {
    categoryData.forEach(category => {
      html +=
        `<div class="panel panel-default category" id="${category.id}" style="background-color:${category.color}">
          <div class="panel-body">
            <h3 class="panel-title">${category.title}</h3>
            <button class="option-btn" type="button" data-toggle="modal"
            data-target="#delete-confirm"
            data-id="${category.id}"
            data-type="category">
              <span class="glyphicon glyphicon-remove">
              </span>
            </button>
          </div>
        </div>`;
    });
  }
  $('#category-list').html(html);
  makeDeleteModalDynamic();
}

function storeLocalCategories(categoryData) {
  categories = categoryData;
}

//display acronym entries in main search area
function displayAcronymEntries(data) {
  let html = '';
  if (data.length) {
    data.forEach(acronym => {
      let {title, color} = getCategoryDataById(acronym.categoryId);

      html +=
        `<div class="col-md-6">
          <div class="panel panel-default">
            <div class="panel-heading clearfix" style="background-color:${color}">
              <h3 class="panel-title">${acronym.acronym}</h3>
              <div class="dropdown">
                <button class="option-btn dropdown-toggle" type="button" id="optionFor${acronym.id}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span class="glyphicon glyphicon-option-vertical">
                  </span>
                </button>
                <ul class="dropdown-menu dropdown-menu-right" aria-labelledby="optionFor${acronym.id}">
                  <li>
                    <a href="#" class="updateLink" data-toggle="modal" data-target="#edit-entry"
                    data-type="acronym"
                    data-id="${acronym.id}"
                    data-acronym="${acronym.acronym}"
                    data-spellout="${acronym.spellOut}"
                    data-definition="${acronym.definition || ''}">
                      Edit
                    </a>
                  </li>
                  <li>
                    <a href="#" class="deleteLink" data-toggle="modal"
                    data-target="#delete-confirm"
                    data-type="acronym"
                    data-id="${acronym.id}">
                      Delete
                    </a>
                  </li>
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
  }
  $('#acronym-entries').html(html);
  makeEditModalDynamic();
}

function makeEditModalDynamic() {
  //make modal dynamic
  $('#edit-entry').on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var id = button.data('id');
    var acronym = button.data('acronym');
    var spellOut = button.data('spellout');
    var definition = button.data('definition');
    $(this).find('.modal-title').text(`Edit ${acronym}`);
    $(this).find('#edit-acronym').val(acronym);
    $(this).find('#edit-spellout').val(spellOut);
    $(this).find('#edit-definition').val(definition);
    $(this).attr('app-data-id', id);
    $('#edit-entry').on('hidden.bs.modal', function(event) {
      $(this).removeAttr('app-data-id');
    });
  });
}

function makeDeleteModalDynamic() {
  //make delete modal dynamic
  $('#delete-confirm').on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var id = button.data('id');
    var type = button.data('type');
    $(this).attr(`${type}-id`, id);
    if (type === 'category') {
      $(this).find('#category-delete-text').text('Deleting a category also deletes all associated acronyms!');
    }
    $('#delete-confirm').on('hidden.bs.modal', function(event) {
      $(this).removeAttr(`${type}-id`);
    });
  });
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
  $('#category-sidebar').on('click', '.category', function() {
    $('.category').removeClass('selectedCategory');
    if ($(this).attr('id') == 'all-categories') {
      getAcronymData(displayAcronymEntries);
      $(this).addClass('selectedCategory');
      //collapses categories list in mobile only
      $('#mobile-category-collapse').collapse('hide');
    } else {
      const categoryId = $(this).attr('id');
      getAcronymData(displayAcronymEntriesByCategory(categoryId));
      $(this).addClass('selectedCategory');
      //collapses categories list in mobile only
      $('#mobile-category-collapse').collapse('hide');
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
      success: function() {
        location.reload();
      }
    });
  });
}

function addEditListener() {
  $('#edit-form').on('submit', function(event) {
    let formInput = {
      id: $('#edit-entry').attr('app-data-id'),
      acronym: $('#edit-acronym').val(),
      spellOut: $('#edit-spellout').val(),
      definition: $('#edit-definition').val() || ''
    }
    console.log(formInput);

    $.ajax({
      type: 'PUT',
      url: BASE_URL + `acronyms/${formInput.id}`,
      processData: false,
      contentType: 'application/json',
      data: JSON.stringify(formInput),
      success: function() {
        location.reload();
      }
    });
  });
}

function addDeleteListener() {
  $('#delete-form').on('submit', function() {
    let deleteUrl = BASE_URL;
    if ($('#delete-confirm').attr('acronym-id')) {
      let id = $('#delete-confirm').attr('acronym-id');
      deleteUrl += `acronyms/${id}`;
    } else if ($('#delete-confirm').attr('category-id')) {
      let id = $('#delete-confirm').attr('category-id');
      deleteUrl += `categories/${id}`;
    }
    console.log(deleteUrl);
    $.ajax({
      type: 'DELETE',
      url: deleteUrl,
      success: function() {
        location.reload();
      }
    });
  });
}

$(function() {
  getCategoryData(displayCategories);
  getAcronymData(displayAcronymEntries);
  addSearchListener();
  addCategoryListener();
  newEntryListener();
  addEditListener();
  addDeleteListener();
});

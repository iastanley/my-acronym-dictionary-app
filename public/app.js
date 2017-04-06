const MOCK_DATA = {
  "acronymList": [
    {
      "id": "1",
      "user": "sam",
      "acronym": "LOL",
      "spellOut": "Laughing Out Loud",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "category": "Casual"
    },
    {
      "id": "2",
      "user": "sam",
      "acronym": "FOMO",
      "spellOut": "Fear Of Missing Out",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "category": "Casual"
    },
    {
      "id": "3",
      "user": "sam",
      "acronym": "TTYL",
      "spellOut": "Talk To You Later",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "category": "Casual"
    },
    {
      "id": "4",
      "user": "sam",
      "acronym": "JSON",
      "spellOut": "JavaScript Object Notation",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "category": "Programming"
    },
    {
      "id": "5",
      "user": "sam",
      "acronym": "PLC",
      "spellOut": "Programmable Logic Controller",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "category": "Programming"
    },
    {
      "id": "6",
      "user": "sam",
      "acronym": "PLC",
      "spellOut": "Phospholipase C",
      "definition": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "category": "Biology"
    }
  ],
  "categoryList": [
    {
      "title": "Casual",
      "color": "#ff00ff"
    },
    {
      "title": "Programming",
      "color": "#00ffff"
    },
    {
      "title": "Biology",
      "color": "#ffff00"
    }
  ]
};

//fake ajax call to get data
function getAcronymData(callback) {
  setTimeout(function(){callback(MOCK_DATA)}, 100);
}

//display categories in sidebar
function displayCategories(data) {
  let html ='<h3 class="text-center">Categories</h3>'
              + '<div class="panel panel-default">'
              + '<div class="panel-body">'
              + 'All Categories'
              + '</div>'
              + '</div>';
  data.categoryList.forEach(category => {
    html +=
      `<div class="panel panel-default" style="background-color:${category.color}">
        <div class="panel-body">
        ${category.title}
        </div>
      </div>`;
  });
  $('#categories').html(html);
}

$(getAcronymData(displayCategories));
//display entries

//search entries by acronym name or spell-out

/* global schools */

const schoolMap = L.map('school-map').setView([39.98185552901966,-75.07970809936523], 11);
const schoolLayer = L.layerGroup().addTo(schoolMap);

L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 18,
  ext: 'png',
}).addTo(schoolMap);

const schoolList = document.querySelector('#school-list');
const gradeLevelSelect = document.querySelector('#grade-level-select');
const zipCodeSelect = document.querySelector('#zip-code-select');

/* ====================

# Exercise: School Explorer (redux)

==================== */

let showSchoolInfo = (school, marker) => {
  const dataFileName = `../../data/demographics/${school['ULCS Code']}.json`;
  fetch(dataFileName)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const first = data[0];
      const pctm = first['MalePCT'];
      const pctf = first['FemalePCT'];

      marker.bindPopup(`<h4>${school['Publication Name']}</h4>
        <ul>
          <li>Percent Male: ${pctm}</li>
          <li>Percent Female: ${pctf}</li>
        </ul>`).openPopup;
  });
};


/* ====================

# Week 4 Code - Crossfiltering of schools

==================== */

let updateSchoolMarkers = (schoolsToShow) => {
  schoolLayer.clearLayers();
  
  schoolsToShow.forEach((school) => {
    const gpsLoc = school['GPS Location'].split(',');
    const marker = L.marker([gpsLoc[0], gpsLoc[1]]).bindTooltip(school['Publication Name']);
    marker.addTo(schoolLayer);

    marker.addEventListener('click', () => {
      showSchoolInfo(school, marker);
    });
  });
};


let updateSchoolList = (schoolsToShow) => {
  while(schoolList.firstChild){ // Check if there is a child li element
    schoolList.removeChild(schoolList.firstChild); // if there is a child, remove it
  }
  let schoolNames = []; // Initialize empty array to hold all schoolNames
  
  schoolsToShow.forEach(school => {
    schoolNames.push(school['Publication Name']); // Add the school name to the schools array
  });

  schoolNames.sort(); // Sort school names alphabetically

  schoolNames.forEach(school => {
    schoolList.appendChild(htmlToElement('<li>' + school + '</li>')); // Add school name to school list
  });
};



let initializeZipCodeChoices = () => {
  let zips = []; // Initialize empty array to hold all possible zipcodes
  // let dropdown = document.getElementById('zip-code-select'); // where to point the zipcodes

  schools.forEach(school => {
    let zip = school['Zip Code'].slice(0, 5); // Remove region codes from zipcodes
    if (!zips.includes(zip)){ // Check for unique zipcodes
      zips.push(zip); // if current zip is not in array, add it
    };
  });

  zips.sort(); // Sort zipcodes descending order

  zips.forEach(zip => {
    zipCodeSelect.appendChild(htmlToElement('<option>' + zip + '</option>')); // Add zipcodes to dropdown menu
  });

};


let filteredSchools = () => {
  let schoolsToShow = []; // Initialize empty array to hold schools matching filter
  let grade = gradeLevelSelect.value; // Get current value at Grade Level selector
  let zip = zipCodeSelect.value; // Get current value at Zip code selector

  schools.forEach(school => {
    // Empty string check is for when 'All' is left as the option
    // Otherwise, append schools that match chosen zip and grade level
    if ((school['Zip Code'].slice(0, 5) === zip || zip === '') && (school[grade] === '1' || grade === '')){
      schoolsToShow.push(school);
    };
  });

  return schoolsToShow;
};

/*

No need to edit anything below this line ... though feel free.

*/

// The handleSelectChange function is an event listener that will be used to
// update the displayed schools when one of the select filters is changed.
let handleSelectChange = () => {
  const schoolsToShow = filteredSchools() || [];
  updateSchoolMarkers(schoolsToShow);
  updateSchoolList(schoolsToShow);
};

gradeLevelSelect.addEventListener('change', handleSelectChange);
zipCodeSelect.addEventListener('change', handleSelectChange);

// The code below will be run when this script first loads. Think of it as the
// initialization step for the web page.
initializeZipCodeChoices();
updateSchoolMarkers(schools);
updateSchoolList(schools);

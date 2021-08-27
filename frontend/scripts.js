/* Imports - https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file */
import { testAPI } from './tests/backend_test.js'; 
import { getCityDataGPS, getCityData, getSupportedCountries, getSupportedStates, getSupportedCities } from './api/air_visual.js'; 
import { Country } from './data/country.js'; 
import { State } from './data/state.js'; 
import { City } from './data/city.js'; 
import { Weather } from './data/weather.js'; 
import { Pollution } from './data/pollution.js'; 
import { firebaseKeyFilter } from './util/util.js';
import { test as country_states_cities_test } from './tests/country_states_cities_test.js';

// Air Visual Constants
const AIR_VISUAL_RESPONSE_SUCCESS = 'success';

// Time Constants
const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;
const MILLISECONDS_IN_SECOND = 1000;

const SECOND = MILLISECONDS_IN_SECOND;                      // In milliseconds
const MINUTE = SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND;  // In milliseconds
const HOUR = MINUTES_IN_HOUR * MINUTE;                      // In milliseconds
const DAY = HOURS_IN_DAY * HOUR;                            // In milliseconds

// Database Variables
const DELETION_DEADLINE = 15 * SECOND;
const airVisualKey = 'air_visual';
const weatherInfoKey = 'weatherInfo';
const countriesKey = 'countries';
const statesKey = 'states';
const citiesKey = 'cities';
const nameKey = 'name';

// Input Data
let latitude = 0;
let longitude = 0;
let city = '';
let state = '';
let country = '';

/* HTML DOM Components */
let btnTestAPI = document.getElementById("btnTestAPI");
let btnCityDataGPS = document.getElementById("btnCityDataGPS");
let btnCityData = document.getElementById("btnCityData");

// Input Elements
let countrySelect = document.getElementById("country-select");
let stateSelect = document.getElementById("state-select");
let citySelect = document.getElementById("city-select");
let latitudeInput = document.getElementById("latitude-input");
let longitudeInput = document.getElementById("longitude-input");

// Read-Only Input Elements
let countrySelectReadonly = document.getElementById("country-select-readonly");
let stateSelectReadonly = document.getElementById("state-select-readonly");
let citySelectReadonly = document.getElementById("city-select-readonly");
let latitudeInputReadonly = document.getElementById("latitude-input-readonly");
let longitudeInputReadonly = document.getElementById("longitude-input-readonly");

// Read-Only Weather Data
let timestampReadonly = document.getElementById("air_visual_ts");
let temperatureReadonly = document.getElementById("air_visual_tp");
let pressureReadonly = document.getElementById("air_visual_pr");
let humidityReadonly = document.getElementById("air_visual_hu");
let windSpeedReadonly = document.getElementById("air_visual_ws");
let windDirectionReadonly = document.getElementById("air_visual_wd");
let weatherIconReadonly = document.getElementById("air_visual_ic");

// Wrap the entire script file in async
// so we can use "await"
async function run() {

    /* Global Variables */

    const env = await fetch('./env.json').then(response => response.json());
    const GoogleAPIKey = env.GoogleAPIKey;
    const PORT = env.port || 3001; // Unnecessary - Backend calls front end and knows the port already
    let map;
    let db;    

    /* Load Map */
    loadGoogleMapsScript(GoogleAPIKey, map, latitude, longitude);
    loadFireBase(env.firebase);

    db = firebase.database();

    /* Listeners */
    btnTestAPI.addEventListener("click", testAPI);
    btnCityDataGPS.addEventListener("click", () => {
        getInputData();
        // First try to get the data from Database
        getCityDataGPS(latitude, longitude, (resultJSON) => {
            console.log(resultJSON);
            let jsonResponse = JSON.parse(resultJSON); // if resultJSON is a string
            if (jsonResponse.status === 'success') {
                fillAirVisualData(jsonResponse);
            } else {
                console.error(`Response Status: ${jsonResponse.status}!`);
            }            
        });
    });
    btnCityData.addEventListener("click", () => {
        getInputData();
        // First try to get the data from Database
        getCityData(city, state, country, (resultJSON) => {
            console.log(resultJSON);
            let jsonResponse = JSON.parse(resultJSON); // if resultJSON is a string
            if (jsonResponse.status === 'success') {
                fillAirVisualData(jsonResponse);
            } else {
                console.error(`Response Status: ${jsonResponse.status}!`);
            }       
        });
    });

    // TODO: Problem where the Select tags keep loading more and more options
    countrySelect.addEventListener('change', () => {
        country = countrySelect.value;
        console.log(`Changed country to: ${country}`);
        removeChildren(citySelect, () => citySelect.childElementCount > 1);
        removeChildren(stateSelect, () => stateSelect.childElementCount > 1);  
        console.log('Removed States and Cities!\nLoading States...');
        loadStateSelectChoices(db, country);
    });
    stateSelect.addEventListener('change', () => {
        state = stateSelect.value;
        console.log(`Changed state to: ${state}`);
        removeChildren(citySelect, () => citySelect.childElementCount > 1);
        console.log('Removed Cities!\nLoading Cities...');
        loadCitySelectChoices(db, country, state);
    });
    citySelect.addEventListener('change', () => {
        city = citySelect.value;        
        console.log(`Changed city to: ${city}`);
    });
    latitudeInput.addEventListener('keypress', (event) => numberOnlyInputHandler(event, latitudeInput));
    longitudeInput.addEventListener('keypress', (event) => numberOnlyInputHandler(event, longitudeInput));
    window.addEventListener("resize", windowResizeHandler);

    windowResizeHandler();

    loadCountrySelectChoices(db);

    // Test
    let test = () => {
        // TODO: 
        //  1. Create classes for each data type (DONE)
        //      - Country   (has states)
        //      - State     (has cities)
        //      - City      (has weather data possible)
        //  2. Check the database for existence of country, state, city triplet, and check if that city has weather already set (DONE)
        //  3. Set timer for X minutes to delete the weather data from a city in firebase so users are forced to call the API again
        //  NOTE: https://stackoverflow.com/questions/37501870/how-to-delete-firebase-data-after-n-days#37504961
        //
        //  4. Save supported countries, states, and cities from the air_visual API
        let america = new Country('America');
        let california = new State('California');
        let san_diego = new City('San Diego');
        let sacramento = new City('Sacramento');
        sacramento.setWeatherInfo({test: 'test value!'})
        california.addCities(san_diego, sacramento);
        let florida = new State('Florida');
        let miami = new City('Miami');
        florida.addCities(miami);
        america.addStates(california, florida);

        let canada = new Country('Canada');
        let quebec = new State('Quebec');
        let alma = new City('Alma');
        let bedford = new City('Bedford');
        quebec.addCities(alma, bedford);
        canada.addStates(quebec);
        
        /* For Setting */
        // db.ref('air_visual').set({
        //     countries: Country.countriesToFirebaseRecord(america, canada)       
        // });

        /* For Reading */
        country = 'America';
        state = 'California';
        city = 'Sacramento';

        // Sorting by values of the key
        // db.ref('air_visual').child('countries').orderByChild('countries').equalTo(country).once('value', snapshot => {
        //     if (snapshot.exists()) {
        //         const specified_country = snapshot.val();
        //         console.log(`Country: ${specified_country}`);
        //     } else {
        //         console.log(`Doesn\'t exist!`);
        //     }
        // });

        getCityWeatherData(db, country, state, city, (cityWeatherData) => {
            console.log(cityWeatherData);
        });        

        // country_states_cities_test();
    };

    // test();
    
}

/* Helper Functions */   

/* Load the Google Maps API - run once */
function loadGoogleMapsScript(GoogleAPIKey, map, latitude, longitude) {

    // Create the script tag, set the appropriate attributes
    let script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GoogleAPIKey}&callback=initMap`;
    script.async = true;

    // Attach your callback function to the `window` object
    window.initMap = function() {
        // JS API is loaded and available
        initMap(map, latitude, longitude);        
    };

    // Append the 'script' element to 'head'
    document.head.appendChild(script);
      
}

/* Initialize the map onto the website */
function initMap(map, latitude, longitude) {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: latitude, lng: longitude },
        zoom: 8,
        restriction: {latLngBounds:{north: 83.8, south: -57, west: -180, east: 180}}
    });

    map.setOptions({ minZoom: 3, maxZoom: 15 });

    const geocoder = new google.maps.Geocoder();

    // Configure the click listener.
    map.addListener("click", (mapsMouseEvent) => {
        let latlng = mapsMouseEvent.latLng;
        let lat = latlng.lat();
        let lon = latlng.lng();

        // console.log(lat_lng) // TESTING

        let latitude_input = document.getElementById("latitude-input");
        let longitude_input = document.getElementById("longitude-input");

        latitude_input.value = lat;
        longitude_input.value = lon;

        // TODO: Enable Billing on Google Cloud Platform in order to use this
        // Reverse Geocoding to get the Country, State, and City of a location using latitude and longitude
        /*
        geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === "OK") {
              if (results[0]) {                
                // console.log(`Results: ${results[0].formatted_address}`); // Testing
              } else {
                window.alert("No results found");
              }
            } else {
              window.alert("Geocoder failed due to: " + status);
            }
        });
        */

    });
}

function loadFireBase(env_firebase) {    

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    let firebaseConfig = {
        apiKey: env_firebase.apiKey,
        authDomain: `${env_firebase.projectId}.firebaseapp.com`,
        projectId: env_firebase.projectId,
        storageBucket: `${env_firebase.bucket}.appspot.com`,
        messagingSenderId: "1080074483465",
        appId: "1:1080074483465:web:645d03d838651a789585d8",
        measurementId: "G-JST48XX1R8"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
}

function windowResizeHandler() {
    let map_container = document.getElementById("map");
    let content_container = document.getElementById("content");

    let map_container_top = map_container.offsetTop;    
    let content_container_padding = parseFloat(window.getComputedStyle(content_container).getPropertyValue('padding-top'));
    let window_height = window.innerHeight; // Bottom of the site

    let map_height = window_height - map_container_top - content_container_padding;

    map_container.style.height = `${map_height}px`;

    // console.log(`map_container_top: ${map_container_top}`); // TESTING
}

function getCityWeatherData(db, country, state, city, callback) {

    db.ref(airVisualKey).child(countriesKey).once('value', (snapshot) => {      

        if (!snapshot.hasChild(country)) {
            return;
        }

        let country_snapshot = snapshot.child(country).child(statesKey);

        if (!country_snapshot.hasChild(state)) {
            return;
        }

        let state_snapshot = country_snapshot.child(state).child(citiesKey);

        if (!state_snapshot.hasChild(city)) {
            return;
        }

        let city_snapshot = state_snapshot.child(city);
        
        if (!city_snapshot.hasChild(weatherInfoKey)) {
            console.log('Weather Not Found! Using API...'); // Testing             
            return;
        }
        
        // Remove city weather if it is past the cutoff period
        let cutoffTime = Date.now() - DELETION_DEADLINE;        
        removeRefBasedOffTimestamp(city_snapshot, cutoffTime);

        let city_weather_snapshot = city_snapshot.child(weatherInfoKey);

        callback(city_weather_snapshot.val());

    });

}

function removeRefBasedOffTimestamp(dbSnapshot, cutoffTime) {
    const TIMESTAMP_KEY = 'timestamp';
    if (dbSnapshot.child(TIMESTAMP_KEY).val() >= cutoffTime){
        // Don't delete (Within cutoff)
    } else {
        // Delete (Past the cutoff)
        dbSnapshot.ref.remove();
    }
}

function removeRefsBasedOffTimestamp(dbRef, cutoffTime) {
    const TIMESTAMP_KEY = 'timestamp';

    let oldItems = dbRef.orderByChild(TIMESTAMP_KEY).endAt(cutoffTime);

    console.log(oldItems)

    oldItems.on('value', (snapshot) => {
        console.log(snapshot.val());
        snapshot.forEach((childSnapshot) => {
            let childRef = childSnapshot.ref;
            let key = childSnapshot.key;
            let childData = childSnapshot.val();

            console.log(childData);

            childRef.remove()
                .then(() => {
                    console.log(`Successfully Removed!`)
                })
                .catch((error) => {
                    console.error(`<ERROR> ${error}`);
                });
        })
    });
}

function loadCountrySelectChoices(db) {

    console.log('Loading Countries into CountrySelect...');

    // <ERROR> This is an event listener so it is recurring!!! Causes problems
    // Check for existence of 'countries' key in the database and that it has more than 0 children
    db.ref(airVisualKey).once('value', (snapshot) => {

        let childSnapshot;
        if (snapshot.hasChild(countriesKey)) {
            childSnapshot = snapshot.child(countriesKey);
        }

        let countries;
        let countryCount;  
        if (childSnapshot) {
            countries = childSnapshot.val();
            countryCount = Object.keys(countries).length;
        }

        if (countryCount && countryCount > 0) {

            // Use database in order to fill the selection      
            console.log('Loading from Database...');
            // console.log(countries);          
            loadOptionItemsInSelect(countrySelect, countries);

        } else {
            // Add child 'countriesKey' and call this function again    
            console.log('No countries Key! Grabbing from API...');        
            getSupportedCountries((response) => {
                const STRING = 'string';
                if (typeof(response) ===  STRING || response instanceof String) {
                    response = JSON.parse(response);
                }

                console.log(response);

                if (response.status != AIR_VISUAL_RESPONSE_SUCCESS) {
                    console.error(`<ERROR> could not get the response for the API. Status: ${response.status}`);
                    return;
                }

                const COUNTRY_KEY = 'country';
                let countries = []
                response.data.forEach((countryJson, index) => {
                    let country = new Country(countryJson[COUNTRY_KEY]);
                    countries.push(country);
                });

                console.log(countries)

                let jsonToPush = {};
                jsonToPush[countriesKey] = Country.countriesToFirebaseRecord(countries);
                // console.log(jsonToPush)
                snapshot.ref.set(jsonToPush);
                loadOptionItemsInSelect(countrySelect, countries);
            });                        
        }
        
    });

}

function loadStateSelectChoices(db, country) {

    console.log('Loading States into StateSelect...');

    // Clean the key for use in firebase
    let originalCountryName = country;
    country = firebaseKeyFilter(country);

    // console.log(`Cleaned Country: ${country}`);

    // <ERROR> This is an event listener so it is recurring!!! Causes problems
    // NOTE: Had to change the layout of the database. The keys were previously the name of the country, but some had '.' in it which aren't allowed
    // Check for existence of 'countries' key in the database and that it has more than 0 children
    db.ref(airVisualKey).once('value', (snapshot) => {

        let childSnapshot;        
        if (countrySelect.value !== 'default' &&
            snapshot.hasChild(countriesKey) && snapshot.child(countriesKey).hasChild(country) && snapshot.child(countriesKey).child(country).hasChild(statesKey)) {
            childSnapshot = snapshot.child(countriesKey).child(country).child(statesKey);
        }

        let countryJson;
        if (countrySelect.value !== 'default' &&
            snapshot.hasChild(countriesKey) && snapshot.child(countriesKey).hasChild(country)) {
            countryJson = snapshot.child(countriesKey).child(country);
        }

        let states;
        let stateCount;  
        if (childSnapshot) {
            states = childSnapshot.val();
            stateCount = Object.keys(states).length;
        }

        // console.log(`State: ${stateSelect.value}`); // Testing
        if (stateCount && stateCount > 0) {

            // Use database in order to fill the selection
            console.log('Loading from Database...');
            // console.log(states);
            loadOptionItemsInSelect(stateSelect, states);

        } else {
            console.log('No states Key! Grabbing from API...');        
            getSupportedStates(country, (response) => {
                const STRING = 'string';
                if (typeof(response) ===  STRING || response instanceof String) {
                    response = JSON.parse(response);
                }

                console.log(response);

                if (response.status !== AIR_VISUAL_RESPONSE_SUCCESS) {
                    console.error(`<ERROR> could not get the response for the API. Status: ${response.status}`);
                    return;
                }

                const STATE_KEY = 'state';
                let states = []
                response.data.forEach((stateJson, index) => {
                    let state = new State(stateJson[STATE_KEY]);
                    states.push(state);
                });

                let jsonToPush;
                if (countryJson) {
                    jsonToPush = countryJson.val();
                } else {
                    let newCountry = new Country(originalCountryName);
                    jsonToPush = newCountry.toFirebaseRecord();
                }

                jsonToPush[statesKey] = State.statesToFirebaseRecord(states);
                snapshot.child(countriesKey).child(country).ref.set(jsonToPush);
                loadOptionItemsInSelect(stateSelect, states);
            }); 
        }
        
    });

}

function loadCitySelectChoices(db, country, state) {

    console.log('Loading Cities into CountrySelect...');
    
    // Clean the key for use in firebase
    let originalStateName = state;
    country = firebaseKeyFilter(country);
    state = firebaseKeyFilter(state);

    // console.log(`Cleaned Country: ${country}`);
    // console.log(`Cleaned State: ${state}`);

    // <ERROR> This is an event listener so it is recurring!!! Causes problems
    // Check for existence of 'countries' key in the database and that it has more than 0 children
    db.ref(airVisualKey).once('value', (snapshot) => {

        let childSnapshot;
        if (stateSelect.value !== 'default' && 
            snapshot.hasChild(countriesKey) && snapshot.child(countriesKey).hasChild(country) && snapshot.child(countriesKey).child(country).hasChild(statesKey) && 
            snapshot.child(countriesKey).child(country).child(statesKey).hasChild(state) && snapshot.child(countriesKey).child(country).child(statesKey).child(state).hasChild(citiesKey)) {
            childSnapshot = snapshot.child(countriesKey).child(country).child(statesKey).child(state).child(citiesKey);
        }

        let stateJson;
        if (stateSelect.value !== 'default' && 
            snapshot.hasChild(countriesKey) && snapshot.child(countriesKey).hasChild(country) && snapshot.child(countriesKey).child(country).hasChild(statesKey) && 
            snapshot.child(countriesKey).child(country).child(statesKey).hasChild(state)) {
            stateJson = snapshot.child(countriesKey).child(country).child(statesKey).child(state);
        }

        let cities;
        let cityCount;
        if (childSnapshot) {
            cities = childSnapshot.val();
            cityCount = Object.keys(cities).length;
        }
        
        if (cityCount && cityCount > 0) {

            // Use database in order to fill the selection
            console.log('Loading from Database...');
            // console.log(cities);
            loadOptionItemsInSelect(citySelect, cities);

        } else {
            console.log('No cities Key! Grabbing from API...');        
            getSupportedCities(state, country, (response) => {
                const STRING = 'string';
                if (typeof(response) ===  STRING || response instanceof String) {
                    response = JSON.parse(response);
                }

                console.log(response);

                if (response.status !== AIR_VISUAL_RESPONSE_SUCCESS) {
                    console.error(`<ERROR> could not get the response for the API. Status: ${response.status}`);
                    return;
                }

                const CITY_KEY = 'city';
                let cities = []
                response.data.forEach((cityJson, index) => {
                    let city = new City(cityJson[CITY_KEY]);
                    cities.push(city);
                });

                let jsonToPush;
                if (stateJson) {
                    jsonToPush = stateJson.val();
                } else {
                    let newState = new State(originalStateName);
                    jsonToPush = newState.toFirebaseRecord();
                }

                jsonToPush[citiesKey] = City.citiesToFirebaseRecord(cities);                         
                snapshot.child(countriesKey).child(country).child(statesKey).child(state).ref.set(jsonToPush);
                loadOptionItemsInSelect(citySelect, cities);
            }); 
        }
        
    });

}

function loadOptionItemsInSelect(selectDOMElem, items) {
    for (let item in items) {          
        let val = items[item];
        let name = val.name;
        
        let itemSelectOption = document.createElement('option');
        // itemSelectOption.innerHTML = item;
        // itemSelectOption.value = item;

        itemSelectOption.innerHTML = name;
        itemSelectOption.value = name;

        selectDOMElem.appendChild(itemSelectOption);
    }
}

function numberOnlyInputHandler(event, DOMElem) {
    event.preventDefault();

    const NEG_ONE = -1;
    let pressedKey;

    // Get the key event (support for all browsers)
    if (event.key !== undefined) {
        pressedKey = event.key;
    } else if (event.keyIdentifier !== undefined) {
        pressedKey = event.keyIdentifier;
    } else if (event.keyCode !== undefined) {
        pressedKey = event.keyCode;
    }

    // Check for occurence of '-' at the beginning
    if (pressedKey === '-' && DOMElem.value.length == 0) {
        DOMElem.value = pressedKey;
        return false;
    }

    let DOMElemValue;
    
    // if it is a number or not
    if (!isNaN(pressedKey)) {
        DOMElemValue = parseFloat(DOMElem.value + pressedKey);            
    } else {
        DOMElemValue = parseFloat(DOMElem.value);
    }        

    let min = DOMElem.getAttribute('min');
    let max = DOMElem.getAttribute('max');

    // NOTE: Assuming element has this
    if (DOMElemValue < min) {
        DOMElemValue = min;
    } else if (DOMElemValue > max) {
        DOMElemValue = max;
    }

    if (isNaN(DOMElemValue)) {
        // Don't change the input value
    } else {
        DOMElem.value = DOMElemValue;
    }      
    
    return false;

}

function getInputData() {
    latitude = parseFloat(latitudeInput.value);
    longitude = parseFloat(longitudeInput.value);
    country = countrySelect.value;
    state = stateSelect.value;
    city = citySelect.value;
}

const removeChildren = (parent, filter) => {
    filter = (filter ? filter : () => true);
    while (parent.lastChild && filter()) {
        parent.removeChild(parent.lastChild);
    }
};

// the responseJson is from AirVisual
function fillAirVisualData(responseJson) {

    let responseData = responseJson.data;

    let responseCity = responseData.city;
    let responseState = responseData.state;
    let responseCountry = responseData.country;

    let coordinates = responseData.location.coordinates; // lat, lng
    let lat = coordinates[0];
    let lng = coordinates[1];

    let weather = new Weather(responseData.current.weather);
    let pollution = new Pollution(responseData.current.pollution);

    countrySelectReadonly.value = responseCountry;
    stateSelectReadonly.value = responseState;
    citySelectReadonly.value = responseCity;
    latitudeInputReadonly.value = lat;
    longitudeInputReadonly.value = lng;

    // Fill weather data from the city below
    const SPACE = ' ';
    const PERCENT = '%';
    const MILLISECONDS = 'ms';

    timestampReadonly.innerHTML = weather.getTimestamp() + MILLISECONDS;
    temperatureReadonly.innerHTML = weather.getTemperature(); + SPACE + weather.getTemperatureUnits();
    pressureReadonly.innerHTML = weather.getAtmosphericPressure();
    humidityReadonly.innerHTML = weather.getHumidity() + PERCENT;
    windSpeedReadonly.innerHTML = weather.getWindSpeed() + SPACE + weather.getWindSpeedUnits();
    windDirectionReadonly.innerHTML = weather.getWindDirection();
    weatherIconReadonly.innerHTML = weather.getWeatherIconCode();

}

run();
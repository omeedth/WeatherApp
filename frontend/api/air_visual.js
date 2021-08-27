const API_BASE = '/air_visual/';
const DIRECTORY_SEPARATOR = '/';

// Goes to backend server and calls the /air_visual API endpoint (latitude, longitude)
function getCityDataGPS(latitude, longitude, callback) {

    // Backend Server Endpoint Name

    // We are passing in the whole number and the decimal separately
    // for the latitude and the longitude because we can't include the
    // "." character in an argument 
    const decimalPlaces = 4;

    let latitude_full_number = floorPosCeilNeg(latitude);
    let latitude_decimal = getNumberToDecimalPlace(latitude, decimalPlaces);

    let longitude_full_number = floorPosCeilNeg(longitude);
    let longitude_decimal = getNumberToDecimalPlace(longitude, decimalPlaces);

    let endpoint = 'city_data_gps/';

    let params = [latitude_full_number, latitude_decimal, longitude_full_number, longitude_decimal, decimalPlaces].filter(Boolean).join(DIRECTORY_SEPARATOR);
    let url = `${API_BASE}${endpoint}${params}`;
    console.log(`URL: ${url}`);

    fetch(url)
    .then(response => {
        if (response.status !== 200) {
            console.error(`GET Failed! Status: ${response.status}`);
            throw 'Backend Call Failed! (May be due to incorrect parameters!)';
        }
        return response.json();
    }).then(data => {        
        callback(data);
    }).catch(error => {
        console.error(`<ERROR> - ${error}`)
    });

}

// Goes to backend server and calls the /air_visual API endpoint (city, state, country)
function getCityData(city, state, country, callback) {

    // Backend Server Endpoint Name

    let endpoint = 'city_data/';

    let params = [city, state, country].filter(Boolean).join(DIRECTORY_SEPARATOR);
    let url = `${API_BASE}${endpoint}${params}`;
    console.log(`URL: ${url}`);

    fetch(url)
    .then(response => {
        if (response.status !== 200) {
            console.error(`GET Failed! Status: ${response.status}`);
            throw 'Backend Call Failed! (May be due to incorrect parameters!)';
        }
        return response.json();
    }).then(data => {        
        callback(data);
    }).catch(error => {
        console.error(`<ERROR> - ${error}`)
    });

}

// Goes to backend server and calls the /air_visual API endpoint (city, state, country)
function getSupportedCountries(callback) {

    // Backend Server Endpoint Name

    let endpoint = 'supported_countries/';

    let url = `${API_BASE}${endpoint}`;
    console.log(`URL: ${url}`);

    fetch(url)
    .then(response => {
        if (response.status !== 200) {
            console.error(`GET Failed! Status: ${response.status}`);
            throw 'Backend Call Failed! (May be due to incorrect parameters!)';
        }
        return response.json();
    }).then(data => {        
        callback(data);
    }).catch(error => {
        console.error(`<ERROR> - ${error}`)
    });

}

// Goes to backend server and calls the /air_visual API endpoint (city, state, country)
function getSupportedStates(country, callback) {

    // Backend Server Endpoint Name

    let endpoint = 'supported_states/';

    let params = [country].filter(Boolean).join(DIRECTORY_SEPARATOR);
    let url = `${API_BASE}${endpoint}${params}`;    
    console.log(`URL: ${url}`);

    fetch(url)
    .then(response => {
        if (response.status !== 200) {
            console.error(`GET Failed! Status: ${response.status}`);
            throw 'Backend Call Failed! (May be due to incorrect parameters!)';
        }
        return response.json();
    }).then(data => {        
        callback(data);
    }).catch(error => {
        console.error(`<ERROR> - ${error}`)
    });

}

// Goes to backend server and calls the /air_visual API endpoint (city, state, country)
function getSupportedCities(state, country, callback) {

    // Backend Server Endpoint Name

    let endpoint = 'supported_cities/';

    let params = [state, country].filter(Boolean).join(DIRECTORY_SEPARATOR);
    let url = `${API_BASE}${endpoint}${params}`;    
    console.log(`URL: ${url}`);

    fetch(url)
    .then(response => {
        if (response.status !== 200) {
            console.error(`GET Failed! Status: ${response.status}`);
            throw 'Backend Call Failed! (May be due to incorrect parameters!)';
        }
        return response.json();
    }).then(data => {        
        callback(data);
    }).catch(error => {
        console.error(`<ERROR> - ${error}`)
    });

}

function getNumberToDecimalPlace(number, decimalPlaces) {
    if (!number || !decimalPlaces) throw 'Invalid Parameters!';

    let decimals_only = number - floorPosCeilNeg(number);
    let result = Math.floor(decimals_only * Math.pow(10, decimalPlaces));    

    return result;
}

function floorPosCeilNeg(number) {
    if (number < 0) {
        return Math.ceil(number);
    } else {
        return Math.floor(number);
    }
}

export { getCityDataGPS, getCityData, getSupportedCountries, getSupportedStates, getSupportedCities }
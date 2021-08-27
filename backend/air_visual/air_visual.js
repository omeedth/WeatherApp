// This whole file is under the "/air_visual" root
const express = require("express");
const request = require("request");
const router = express.Router();

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date.now())
    next()
});

// Variables
const API_BASE = 'http://api.airvisual.com/v2/';
const API_KEY = process.env.AirVisualAPIKey;
const PARAM_SEPARATOR = '&';

const number_regex = "^-?\d+$"; // ERROR: \d is not supported for some reason
const decimal_number_regex = "-?\d+(.?\d+)"; // ERROR: "." period is not allowed to be used
const number_regex_2 =  "-?[0-9]+"

router.get(`/city_data_gps/:latitudeWholeNumber(${number_regex_2})/:latitudeDecimal(${number_regex_2})/:longitudeWholeNumber(${number_regex_2})/:longitudeDecimal(${number_regex_2})/:decimalDigits(${number_regex_2})`, (req, res) => { // `/city_data_gps/:latitude(${decimal_number_regex})/:longitude(${decimal_number_regex})`
    // Recreate the latitude and longitude by stitching together the whole number and the decimal part of it
    // We do this by adding the whole number to the decimal part of it divided by 10^(number of digits in decimal) 
    // so that it gets pushed to the decimals place
    const BASE_10 = 10;
    let decimalDigits = parseInt(req.params.decimalDigits);

    /* PROBLEM - this can be variable depending on "-" sign as well as if the number has 0's at the beginning */
    // let latitude_decimal_digits = (req.params.latitudeDecimal.startsWith('-') ? req.params.latitudeDecimal.length - 1 : req.params.latitudeDecimal.length);
    // let longitude_decimal_digits = (req.params.longitudeDecimal.startsWith('-') ? req.params.longitudeDecimal.length - 1 : req.params.longitudeDecimal.length);

    let latitude = parseInt(req.params.latitudeWholeNumber, BASE_10)  + (parseInt(req.params.latitudeDecimal, BASE_10) / Math.pow(BASE_10, decimalDigits));
    let longitude = parseInt(req.params.longitudeWholeNumber, BASE_10)  + (parseInt(req.params.longitudeDecimal, BASE_10) / Math.pow(BASE_10, decimalDigits));

    // Constructing API Call
    let api_endpoint = 'nearest_city?';
    let latitude_param = `lat=${latitude}`;
    let longitude_param = `lon=${longitude}`;
    let key_param = `key=${API_KEY}`;
    let params = [latitude_param, longitude_param, key_param].filter(Boolean).join(PARAM_SEPARATOR);

    let uri = API_BASE + api_endpoint + params;
    request(uri, function(error, response, body) {
        res.json(body);  // WORKS -> Commented out to save API Call Count        
    });

    //res.json({message: "This is the City Data GPS Route!", latitude: latitude, longitude: longitude}); // TEST

});

router.get(`/city_data/:city/:state/:country`, (req, res) => {
    let city = req.params.city;
    let state = req.params.state;
    let country = req.params.country;

    // Constructing API Call
    let api_endpoint = 'city?';
    let city_param = `city=${city}`;
    let state_param = `state=${state}`;
    let country_param = `country=${country}`;
    let key_param = `key=${API_KEY}`;
    let params = [city_param, state_param, country_param, key_param].filter(Boolean).join(PARAM_SEPARATOR);

    let uri = API_BASE + api_endpoint + params;
    request(uri, function(error, response, body) {
        res.json(body);  // WORKS -> Commented out to save API Call Count        
    });

    //res.json({message: "This is the City Data Route!", city: city, state: state, country: country}); // TEST

});

/* TODO: Add supported countries, states, cities */

router.get(`/supported_countries`, (req, res) => {

    // Constructing API Call
    let api_endpoint = 'countries?';
    let key_param = `key=${API_KEY}`;
    let params = [key_param].filter(Boolean).join(PARAM_SEPARATOR);

    let uri = API_BASE + api_endpoint + params;
    request(uri, function(error, response, body) {
        res.json(body);  // WORKS -> Commented out to save API Call Count        
    });

    //res.json({message: "This is the Supported Countries Route!"}); // TEST

});

router.get(`/supported_states/:country`, (req, res) => {

    let country = req.params.country;

    // Constructing API Call
    let api_endpoint = 'states?';
    let country_param = `country=${country}`;
    let key_param = `key=${API_KEY}`;
    let params = [country_param, key_param].filter(Boolean).join(PARAM_SEPARATOR);

    let uri = API_BASE + api_endpoint + params;
    request(uri, function(error, response, body) {
        res.json(body);  // WORKS -> Commented out to save API Call Count        
    });

    //res.json({message: "This is the Supported States Route!", country: country}); // TEST

});

router.get(`/supported_cities/:state/:country`, (req, res) => {

    let country = req.params.country;
    let state = req.params.state;

    // Constructing API Call
    let api_endpoint = 'cities?';
    let state_param = `state=${state}`;
    let country_param = `country=${country}`;
    let key_param = `key=${API_KEY}`;
    let params = [state_param, country_param, key_param].filter(Boolean).join(PARAM_SEPARATOR);

    let uri = API_BASE + api_endpoint + params;
    request(uri, function(error, response, body) {
        res.json(body);  // WORKS -> Commented out to save API Call Count        
    });

    //res.json({message: "This is the Supported Cities Route!", state: state, country: country}); // TEST

});

module.exports = router;
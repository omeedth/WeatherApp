/* Require Statements */
const express = require("express");
const path = require('path');

/* Internal Files/Imports */
const air_visual = require('./air_visual/air_visual');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

/* Middleware */

/* Constant/Project Variables */
const FRONTEND_PATH = path.resolve("../frontend");
const PORT = process.env.PORT || 3001;

/* Initialize the app instance using Express JS framework */
const app = express();

// The app will be listening on PORT for any API calls from the frontend application
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
//   test();
});

/* Test Functions */
function test() {
    console.log(`__dirname: ${__dirname}`)
    console.log(`Frontend Path: ${FRONTEND_PATH}`);
}

/* API Requests */

app.use('/', express.static(FRONTEND_PATH)); // Main Endpoint -> Displays the website
app.use('/', express.static(`${FRONTEND_PATH}/data`)); // Main Endpoint's Data Directory
app.use('/', express.static(`${FRONTEND_PATH}/tests`)); // Main Endpoint's Test Directory
app.use('/', express.static(`${FRONTEND_PATH}/api`)); // Main Endpoint's API Directory (Where all the api calls are separated in files)

app.use('/air_visual', air_visual);

app.get("/test", (req, res) => {
    res.json({message: "Hello from the server!"});
});
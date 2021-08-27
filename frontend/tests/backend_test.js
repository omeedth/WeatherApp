// Goes to backend server and calls the /test API endpoint
function testAPI() {

    // Backend Server Endpoint Name

    fetch('/test')
    .then(response => {
        return response.json();
    }).then(data => {
        console.log(data.message);
    }).catch(error => {
        console.error(`<ERROR> - ${error}`)
    });

}

export { testAPI }
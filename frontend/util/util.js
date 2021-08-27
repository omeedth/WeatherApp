
// cannot contain ., $, #, [, ], /, or ASCII control characters 0-31 or 127
// https://firebase.google.com/docs/database/web/structure-data
function firebaseKeyFilter(oldKey) {
    const PROHIBITED_CHARACTERS = ['.', '$', '[', ']', '/'];
    let newKey = '';
    for (let index in oldKey) {
        let char = oldKey[index];
        if (!(PROHIBITED_CHARACTERS.includes(char))) newKey += char;
    }
    return newKey;
}

export {firebaseKeyFilter};
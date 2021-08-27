import { State } from "./state.js"; 
import { firebaseKeyFilter } from "../util/util.js";

class Country {
    constructor(name) {
        this.name = name;               // String
        this._states = [];              // List<State>
        this._timestamp = Date.now();   // timestamp in milliseconds
    }

    getTimestamp() {
        return this._timestamp;
    }

    addStates(...states) {
        if (states && Array.isArray(states) && states.length > 0 && states[0] instanceof State) {
            this._states.push(...states);
        } else {
            console.error('<ERROR> Invalid parameter, can\'t push the list of states into the array!');
        }      
    }

    toFirebaseRecord() {
        return {
            "name": this.name,
            // timestamp: this._timestamp,
            states: this._statesToJSON()
        }
    } 

    _statesToJSON() {
        let result = {};
        this._states.forEach((state, index) => {
            result[state.name] = state.toFirebaseRecord(); // Change to just be a list (each key is the index)
        });
        return result;
    }

    static countriesToFirebaseRecord(countries) {
        if (countries && Array.isArray(countries) && countries.length > 0 && countries.every((country, index, array) => country instanceof Country)) {
            let result = {};
            // console.log(countries)
            countries.forEach((country, index) => {
                let firebaseCleanName = firebaseKeyFilter(country.name);
                result[firebaseCleanName] = country.toFirebaseRecord();              
            });
            return result;
        } else {
            console.error(`<ERROR> Invalid parameter! The parameter is possibly not entirely made up of Country objects, or isn\'t a list!`);
        }
    }

    toString() {
        return `<${this.name}> ${this._states}`;
    }
}

export { Country }
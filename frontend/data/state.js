import { City } from "./city.js";
import { firebaseKeyFilter } from "../util/util.js";

class State {
    constructor(name, cities) {
        this.name = name;               // String
        this._cities = [];              // List<State>
        this._timestamp = Date.now();   // timestamp in milliseconds
    }

    getTimestamp() {
        return this._timestamp;
    }

    addCities(...cities) {
        if (cities && Array.isArray(cities) && cities.length > 0 && cities[0] instanceof City) {
            this._cities.push(...cities);
        } else {
            console.error('<ERROR> Invalid parameter, can\'t push the list of cities into the array!');
        }      
    }

    toFirebaseRecord() {
        return {
            "name": this.name,
            // timestamp: this._timestamp,
            cities: this._citiesToJSON()
        }
    } 

    _citiesToJSON() {
        let result = {};
        this._cities.forEach((city, index) => {
            result[city.name] = city.toFirebaseRecord(); // Change to just be a list (each key is the index)
        });
        return result;
    }

    static statesToFirebaseRecord(states) {
        if (states && Array.isArray(states) && states.length > 0 && states.every((state, index, array) => state instanceof State)) { 
            let result = {};
            states.forEach((state, index) => {
                let firebaseCleanName = firebaseKeyFilter(state.name);
                result[firebaseCleanName] = state.toFirebaseRecord();
            });
            return result;
        } else {
            console.error(`<ERROR> Invalid parameter! The parameter is possibly not entirely made up of State objects, or isn\'t a list!`);
        }
    }

    toString() {
        return `<${this.name}> ${this._cities}`;
    }
}

export { State }
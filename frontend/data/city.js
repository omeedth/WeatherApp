import { firebaseKeyFilter } from "../util/util.js";

class City {
    constructor(name) {
        this.name = name;               // String
        this._weatherInfo = null;       // JSON
        this._timestamp = Date.now();   // timestamp in milliseconds
    }

    getTimestamp() {
        return this._timestamp;
    }

    setWeatherInfo(weatherInfo) {
        this._weatherInfo = weatherInfo;
    }

    toFirebaseRecord() {
        return {
            "name": this.name,
            timestamp: this._timestamp,
            weatherInfo: this._weatherInfo
        }
    } 

    static citiesToFirebaseRecord(cities) {
        if (cities && Array.isArray(cities) && cities.length > 0 && cities.every((city, index, array) => city instanceof City)) {
            let result = {};
            cities.forEach((city, index) => {
                let firebaseCleanName = firebaseKeyFilter(city.name);
                result[firebaseCleanName] = city.toFirebaseRecord();
            });
            return result;
        } else {
            console.error(`<ERROR> Invalid parameter! The parameter is possibly not entirely made up of City objects, or isn\'t a list!`);
        }
    }

    toString() {
        return `<${this.name}> ${this._weatherInfo}`;
    }
}

export { City }
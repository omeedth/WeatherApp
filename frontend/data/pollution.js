class Pollution {
    constructor(airVisualJson) {
        this._ts; // Timestamp
        this._aqius; // AQI value based on US EPA standards
        this._aqicn; // AQI value based on China MEP standards
        this._mainus; // Main Pollutant for US AQI
        this._maincn; // Main Pollutant for Chinese AQI

        if (airVisualJson) {            
            this.loadFromJSON(airVisualJson);
        }
    }

    // Specifically from Pollution sub-json
    loadFromJSON(airVisualJson) {
        this._ts = airVisualJson.ts;
        this._aqius = airVisualJson.aqius;
        this._aqicn = airVisualJson.aqicn;
        this._mainus = airVisualJson.mainus;
        this._maincn = airVisualJson.maincn;
    }

    getTimestamp() {
        return this._ts;
    }

    getTemperature() {
        return this._tp;
    }

    getAtmosphericPressure() {
        return this._pr;
    }

    getHumidity() {
        return this._hu;
    }

    getWindSpeed() {
        return this._ws;
    }

    getWindDirection() {
        return this._wd;
    }

    getWeatherIconCode() {
        return this._ic;
    }

    toString() {
        return `Pollution:\n${{ts: this._ts, aqius: this._aqius, aqicn: this._aqicn, mainus: this._mainus, maincn: this._maincn}}`;
    }
}

export { Pollution }
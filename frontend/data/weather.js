class Weather {
    constructor(airVisualJson) {
        this._ts; // Timestamp
        this._tp; // Temperature in Celsius
        this._pr; // Atmospheric Pressure
        this._hu; // Humidity
        this._ws; // Wind Speed
        this._wd; // Wind Direction
        this._ic; // Weather Icon Code

        this._tp_units = 'Celsius';
        this._ws_units = 'Kilometers Per Hour';

        if (airVisualJson) {            
            this.loadFromJSON(airVisualJson);
        }
    }

    // Specifically from Weather sub-json
    loadFromJSON(airVisualJson) {
        this._ts = airVisualJson.ts;
        this._tp = airVisualJson.tp;
        this._pr = airVisualJson.pr;
        this._hu = airVisualJson.hu;
        this._ws = airVisualJson.ws;
        this._wd = airVisualJson.wd;
        this._ic = airVisualJson.ic;
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

    getTemperatureUnits() {
        return this._tp_units;
    }

    getWindSpeedUnits() {
        return this._ws_units;
    }

    toString() {
        return `Weather:\n${{ts: this._ts, tp: this._tp, pr: this._pr, hu: this._hu, ws: this._ws, wd: this._wd, ic: this._ic}}`;
    }
}

export { Weather }
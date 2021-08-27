import { Country } from '../data/country.js'; 
import { State } from '../data/state.js'; 
import { City } from '../data/city.js'; 

function test() {
    let america = new Country('America');
    let california = new State('California');
    let san_diego = new City('San Diego');
    let sacramento = new City('Sacramento');
    california.addCities(san_diego, sacramento);
    let florida = new State('Florida');
    let miami = new City('Miami');
    florida.addCities(miami);
    america.addStates(california, florida);

    let canada = new Country('Canada');
    let quebec = new State('Quebec');
    let alma = new City('Alma');
    let bedford = new City('Bedford');
    quebec.addCities(alma, bedford);
    canada.addStates(quebec);

    console.log(america);
    console.log(canada);
    console.log(Country.countriesToFirebaseRecord(america, canada));
}

export { test };
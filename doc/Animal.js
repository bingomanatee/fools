var Fools = require('./../fools');
var _ = require('lodash');
var util = require('util');

var state = _.template('ANIMAL <%= name %>(<%= type %>) @ <%= location %>: <% if (alive){%> hunger: <%= hunger %> <%} else {%> DEAD: <%= note %> <% } %>');
var id = 0;

function Animal(name, animalType, grass, animals, alert_level) {
    var animal = {
        id: ++id,
        name: name,
        hunger: 0,
        fatigue: 0,
        male: true,
        location: Math.floor(Math.random() * grass.length),
        awake: true,
        alive: true,
        type: animalType,
        note: ''
    };

    function live_goats() {
        return _.filter(animals, function(a) {
            return a.type == 'goat' && a.alive;
        });
    }



    function hunt(animal, my_prey){
        animal.hunger -= Math.ceil(10 / (1 + my_prey.hunger));
        my_prey.alive = false;
        my_prey.note = 'eaten by' + animal.name;
        if (alert_level > 0) {
            console.log('!!!!!! %s ATE %s', animal.status(), my_prey.status());
        }
    }

    animal.kill = function() {
        var my_prey = prey(animal);
        if (my_prey) {
            hunt(animal, my_prey);
        } else {
            var my_hard_prey = hard_prey(animal);
            if (my_hard_prey) {
                hunt(animal, my_hard_prey);
            }
        }
    };

    function wander(animal) {
        if (animal.location <= 0) {
            animal.location = 1;
        } else if (animal.location >= grass.length) {
            animal.location = grass.length - 1;
        } else if (Math.random() >= 0.5) {
            ++animal.location;
        } else {
            --animal.location;
        }
        return animal;
    }

    animal.status = function() {
        return state(animal);
    };

    animal.get_hungry = function() {
        switch (animal.type) {

            case 'goat':
                animal.hunger += 0.5;
                break;

            case 'wolf':
                animal.hunger += 0.25;
                break;
        }
    };

    animal.can_eat = function() {
        switch (animal.type) {
            case 'goat':
                return grass[animal.location] > 0;
                break;

            case 'wolf':
                return prey(animal);
                break;

            default:
                return false;
        }
    };
    
    animal.moved = function(){
        ++animal.hunger;
        animal.fatigue += 0.5;
    };
    
    function seekPrey(method, loc){
        if (arguments.length < 2){
            var locations = [animal.location, animal.location - 1, animal.location + 1];
            return _.reduce(locations, function(prey, loc){
                return prey ? prey : seekPrey(method, loc);
            }, false)
        } else {
            return method({location: loc})
        }
    }

    animal.seekPrey = function() {

        if (animal.hunger < 2 ){
            wander(animal);
            animal.moved();

        } else { // hungry like the wolf

        // pass one - stalking goats
        var p = seekPrey(prey) || seekPrey(hard_prey);

        if (p) {
            if (!p.alive) {
                var p1 = seekPrey(prey);
                var p2 = seekPrey(hard_prey);
                throw ('should not stalk dead prey');
            }
            if (p.id == animal.id) {
                var p1 = seekPrey(prey);
                var p2 = seekPrey(hard_prey);
                throw ('should not stalk self!');
            }
            if (alert_level > 0) {
                console.log('%s STALKING %s', animal.status(), p.status());
            }
            
            if (p.location != animal.location){
                animal.location = p.location;
                animal.moved();
            }

        } else {
            if (alert_level > 2) {
                console.log('%s STALKING/WANDERING ', animal.status());
            }
            wander(animal);
            animal.moved();
        }

    }
        return animal;
    };

    function prey(wolf) {
        var nearAnimals = Fools.pairs(function(w, g) {
            return  (g.id != wolf.id) &&  g.alive && (w.location == g.location);
        }, true)([wolf], live_goats())[0];
        if (nearAnimals) {
            var prey = nearAnimals[1];
            return _.first(_.shuffle(prey));
        } else {
            return false;
        }
    }

    function other_animals() {
        return _.filter(animals, function(a) {
            return a.id != animal.id;
        })
    }

    function hard_prey(wolf) {
        var nearAnimals = Fools.pairs(function(w, g) {
            return (g.id != wolf.id) &&  (g.alive) && ( w.location == g.location);
        }, true)([wolf], other_animals())[0];
        if (nearAnimals) {
            var prey = nearAnimals[1];
            return _.first(_.shuffle(prey));
        } else {
            return false;
        }
    }

    return animal;
}

module.exports = Animal;

var Fools = require('./../fools');
var _ = require('lodash');
var util = require('util');

function scenario(ratio, MAX_TURNS, animalCount, mapSize, grassLength, regrowthRate) {
    var alert_level = 0;
    var grass = _.map(_.range(0, mapSize), function () {
        return grassLength;
    });

    var state = _.template('ANIMAL <%= name %>(<%= type %>) @ <%= location %>: <% if (alive){%> hunger: <%= hunger %> <%} else {%> DEAD: <%= note %> <% } %>');
     var id = 0;
    function Animal(name, animalType) {
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

        animal.status = function () {
            return state(animal);
        };

        animal.get_hungry = function(){
            switch(animal.type){

                case 'goat':
                    animal.hunger += 0.5;
                    break;

                case 'wolf':
                    animal.hunger += 0.25;
                    break;
            }
        }

        return animal;
    }

    var animals = _.map(_.range(0, animalCount), function (i) {
        var animalType = i / animalCount > ratio ? 'wolf' : 'goat';
        return Animal(animalType + '_' + i, animalType);
    });

    var goats = _.filter(animals, function (a) {
        return a.type == 'goat';
    });

    /** tests **/

    function is_sleeping(goat) {
        return !goat.awake;
    }

    function is_fatigued(animal) {
        return animal.fatigue > 5 && animal.hunger < 3;
    }

    function is_hungry(animal) {
        switch (animal.type) {
            case 'goat':
                return animal.hunger > 1;
                break;

            case 'wolf':
                return animal.hunger > 3;
                break;
        }
    }

    function can_eat(animal) {
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
    }

    function is_starved(goat) {
        return goat.hunger > 10;
    }

    function is_dead(goat) {
        return !goat.alive;
    }

    /** activity **/

    function live_goats() {
        return _.filter(goats, 'alive');
    }

    function prey(wolf) {
        var nearGoats = Fools.pairs(function (w, g) {
            return g.alive && (w.location == g.location) ;
        }, true)([wolf], live_goats())[0];
        if (nearGoats) {
            var prey = nearGoats[1];
            return _.first(_.shuffle(prey));
        } else {
            return false;
        }
    }

    function other_animals(wolf){
        return _.filter(animals, function(a){
            return a.id != wolf.id;
        })
    }

    function hard_prey(wolf) {
        var nearGoats = Fools.pairs(function (w, g) {
            return (g.alive) && ( w.location == g.location);
        }, true)([wolf], other_animals(wolf))[0];
        if (nearGoats) {
            var prey = nearGoats[1];
            return _.first(_.shuffle(prey));
        } else {
            return false;
        }
    }

    function do_nothing(goat) {
        if (goat.alive) {
            if (alert_level > 3) {
                console.log('-- %s %s is idle', goat.type, goat.name);
            }
        }
        return goat;
    }

    function rest(goat) {
        goat.awake = false;
        if (alert_level > 2) {
            console.log('-- %s %s is resting', goat.type, goat.name);
        }
        goat.fatigue--;
        if (goat.fatigue <= 0) {
            if (alert_level > 1) {
                console.log('-- %s %s woke up', goat.type, goat.name);
            }
            goat.fatigue = 0;
            goat.awake = true;
        }
        return goat;
    }

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
        ++animal.hunger;
        animal.fatigue += 0.5;
        return animal;
    }

    function move(animal) {
        switch (animal.type) {
            case 'goat':
                wander(animal);
                if (alert_level > 1) {
                    console.log('-- %s ...... moved', animal.status());
                }
                break;

            case 'wolf':
                var p = prey(animal);

                // pass one - stalking goats
                if (p) {
                    // stay put
                } else {
                    var back = {location: animal.location - 1};
                    p = prey(back);
                    if (p) {
                        animal.location--;
                    } else {
                        var forward = {location: animal.location + 1};
                        p = prey(forward);
                        if (forward) {
                            animal.location++;
                        }
                    }
                }

                // pass two -- stalking other wolves!
                p = hard_prey(animal);
                if (p) {
                    // stay put
                } else {
                    var back = {location: animal.location - 1};
                    p = hard_prey(back);
                    if (p) {
                        animal.location--;
                    } else {
                        var forward = {location: animal.location + 1};
                        p = hard_prey(forward);
                        if (forward) {
                            animal.location++;
                        }
                    }
                }

                if (p) {
                    if (!p.alive){
                        throw new Error('should not stalk dead prey');
                    }
                    if (alert_level > 0) {
                        console.log('%s STALKING %s', animal.status(), p.status());
                    }
                    eat(animal);
                } else {
                    if (alert_level > 2) {
                        console.log('%s WANDERING ', animal.status());
                    }
                    wander(animal);
                }
                break;
        }
        return animal;
    }

    function hunt(animal, my_prey){
        animal.hunger -= Math.ceil(10 / (1 + my_prey.hunger));
        my_prey.alive = false;
        my_prey.note = 'eaten by' + animal.name;
        if (alert_level > 0) {
            console.log('!!!!!! %s ATE %s', animal.status(), my_prey.status());
        }
    }

    function eat(animal) {

        switch (animal.type) {
            case 'goat':
                var grass_value = grass[animal.location];
                if (grass_value <= 0) {
                    return;
                } else if (grass_value < 1) {
                    animal.hunger -= grass_value;
                    grass[animal.location] = 0;
                } else {
                    --grass[animal.location];
                    --animal.hunger;
                }
                if (alert_level > 2) {
                    console.log('animal %s EATS GRASS', animal.status());
                }
                break;

            case 'wolf':
                var my_prey = prey(animal);
                if (my_prey) {
                    hunt(animal, my_prey);
                } else {
                    var my_hard_prey = hard_prey(animal);
                    if (my_hard_prey){
                        hunt(animal, my_hard_prey);
                    }
                }
                break;

        }

        return animal;
    }

    function starveToDeath(animal) {
        if (alert_level > 0) {
            console.log('!!!! %s starved to death!', animal.status());
            console.log('grass: %s', grass.join('  '));
        }
        animal.alive = false;
        animal.note = 'starved to death';

        return animal;
    }

    /** turn processes */

    var goat_action = Fools.fork(is_dead)
        .then(do_nothing)
        .else(Fools.fork(is_starved)
            .then(starveToDeath)
            .else(Fools.fork(is_sleeping)
                .then(rest)
                .else(Fools.fork(is_fatigued)
                    .then(rest)
                    .else(Fools.fork(is_hungry)
                        .then(Fools.fork(can_eat)
                            .then(eat)
                            .else(function (animal) {
                                if (alert_level > 2) {
                                    console.log('animal %s cannot eat -- looks for food', animal.status());

                                }
                                move(animal);
                            })
                    ).else(do_nothing)
                )
            )
        )
    );

    var animal_turn = function (goat) {
        Fools.pipe(goat_action, function (goat) {
            /*  if (goat.alive){
             console.log('goat %s: awake: %s, fatigue: %s, hunger: %s, location: %s',
             goat.name, goat.awake, goat.fatigue, goat.hunger, goat.location)
             } else {
             console.log('goat %s: xxxxxxxx', goat.name);
             }*/
        })(goat);
    };

    function growGrass() {
        grass = _.map(grass, function (length) {
            if (length >= grassLength) {
                return grassLength;
            }

            if (Math.random() < regrowthRate) {
                return ++length;
            } else {
                return length;
            }
        })
    }

    var turns = 0;
    while (_.find(animals, function (a) {
        return a.alive
    }) && ++turns < MAX_TURNS) {
        /**
         * simulate each animal in turn
         */
        if (alert_level > 1) {
            console.log('_________ TURN: %s ______________', turns);
        }
        _.each(animals, animal_turn);

        /**
         * any active animal gets gradually hungry
         */
        _.each(animals, function (animal) {
            if (animal.awake) {
                animal.get_hungry();
            }
        });

        /**
         * some of the grass grows back.
         */
        growGrass();

        if (alert_level > 2) {
            console.log('grass: %s', grass.join('   '));
        }
    }

    if (alert_level > 0) {
        console.log('grass: %s', grass.join('   '));
    }
    _.each(animals, function (animal) {
        if (alert_level > 0) {
            console.log('animal state: %s', animal.status());
        }
    });

    return [turns, _.filter(animals, function (animal) {
        return animal.alive;
    }), grass, animals];
}

/* ************** RUNNING SCENARIOS ******************* */

/**
 * simulating based on a range of animal counts; grass is lush but grows back rarely
 *
 */

var grassSize = 5;
var growthRate = 0.1;
var max_turns = 50;
_.each([2, 6, 12, 20], function(animalCount){

_.each([8, 12, 24, 40], function (mapSize) {
    _.each(_.range(4, 10), function (range) {
        var ar = range / 10;
        console.log('animal ratio: %s', ar);
        var result = scenario(ar, max_turns, animalCount, mapSize, grassSize, growthRate);
        console.log('===================================');
        console.log('map size: %s, duration: %s/%s, of %s starting animals, %s survived',
            mapSize, result[0], max_turns, animalCount, result[1].length);
        console.log('grass: %s', result[2].join(' '));
        _.each(result[3], function(animal){
            console.log(animal.status())
        })
    });
});
})
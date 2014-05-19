var Fools = require('./../fools');
var _ = require('lodash');
var util = require('util');
var Animal = require('./Animal');

function scenario(ratio, MAX_TURNS, animalCount, mapSize, grassLength, regrowthRate) {
    var alert_level = 10;
    var grass = _.map(_.range(0, mapSize), function() {
        return grassLength;
    });

    var animals = [];
    _.each(_.range(0, animalCount), function(i) {
        var animalType = i / animalCount > ratio ? 'wolf' : 'goat';
        animals.push(Animal(animalType + '_' + i, animalType, grass, animals, alert_level));
    });

    var goats = _.filter(animals, function(a) {
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
        if (alert_level > 4) {
            console.log('animal %s %s', animal.name, animal.can_eat() ? 'can eat' : 'cannot eat');
        }
        return animal.can_eat();
    }

    function is_starved(goat) {
        return goat.hunger > 10;
    }

    function is_dead(goat) {
        return !goat.alive;
    }

    function is_wolf(animal) {
        return animal.type == 'wolf';
    }

    /** activity **/

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
        return animal;
    }

    function move(animal, dest) {
        if (arguments.length > 1) {
            animal.location = dest;
        } else {
            wander(animal);
        }
        animal.moved();
        return animal;
    }

    function eat(animal) {

        switch (animal.type) {
            case 'goat':
                var grass_available = Math.min(1, grass[animal.location]);
                grass[animal.location] -= grass_available;
                animal.hunger -= grass_available;

                if (alert_level > 2) {
                    console.log('animal %s EATS %s GRASS', animal.status(), grass_available);
                }
                if (!grass_available) {
                    if (alert_level > 0) {
                        console.log('animal %s _______ has no grass! ', animal.status());
                    }
                }
                break;

            case 'wolf':
                animal.kill();
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
        animal.note = 'starved to death with grass ' + grass.join('');

        return animal;
    }

    function forage(animal) {
        var bestGrass = 0;
        var target = _.reduce(_.range(Math.max(0, animal.location - 1), Math.min(grass.length - 1, animal.location + 1)), function(dest, loc) {
            if (grass[loc] > bestGrass) {
                bestGrass = grass[loc];
                return loc;
            } else {
                return dest;
            }
        }, animal.location);
        move(animal, target);
        if (animal.hunger > 7) {
            console.log('hungry %s moved to %s', animal.status(), target);
        }
        return animal;
    }

    function seekPrey(animal) {
        animal.seekPrey();
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
                            .else(Fools.fork(is_wolf)
                                .then(seekPrey)
                                .else(forage))
                    ).else(move)
                )
            )
        )
    );

    var animal_turn = function(goat) {
        Fools.pipe(goat_action, function(goat) {
            /*  if (goat.alive){
             console.log('goat %s: awake: %s, fatigue: %s, hunger: %s, location: %s',
             goat.name, goat.awake, goat.fatigue, goat.hunger, goat.location)
             } else {
             console.log('goat %s: xxxxxxxx', goat.name);
             }*/
        })(goat);
    };

    function growGrass() {
        grass = _.map(grass, function(length) {
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
    while (_.find(animals, function(a) {
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
        _.each(animals, function(animal) {
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
    _.each(animals, function(animal) {
        if (alert_level > 0) {
            console.log('animal state: %s', animal.status());
        }
    });

    return [turns, _.filter(animals, function(animal) {
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
_.each([2, 6, 12, 20], function(animalCount) {

    _.each([8, 12, 24, 40], function(mapSize) {
        _.each(_.range(4, 10), function(range) {
            var ar = range / 10;
            console.log('animal ratio: %s', ar);
            var result = scenario(ar, max_turns, animalCount, mapSize, grassSize, growthRate);
            console.log('===================================');
            console.log('map size: %s, duration: %s/%s, of %s starting animals, %s survived',
                mapSize, result[0], max_turns, animalCount, result[1].length);
            console.log('grass: %s', result[2].join(' '));
            _.each(result[3], function(animal) {
                console.log(animal.status())
            })
        });
    });
})

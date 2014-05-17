var Fools = require('./../fools');
var _ = require('lodash');

var each = Fools.each()
    .add(_.isNumber)
    .add(function (n) {
        return n > 0
    })
    .add(function (n) {
        return !(n % 2)
    });


_.each(['g', -4, 0, 1, 2, 3, 4, {}], function(n){
    console.log('"%s" is positive odd number: %s', n, each(n));
});

/**
 "g" is positive odd number: false
 "-4" is positive odd number: false
 "0" is positive odd number: false
 "1" is positive odd number: false
 "2" is positive odd number: true
 "3" is positive odd number: false
 "4" is positive odd number: true
 "[object Object]" is positive odd number: false
 */
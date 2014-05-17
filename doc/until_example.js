var Fools = require('./../fools');
var _ = require('lodash');

var until = Fools.until()
    .add(function (n) {
        return !_.isNumber(n);
    })
    .add(function (n) {
        return n < 0
    })
    .add(function (n) {
        return (n % 2);
    })
    .add(function(n){
        return true;
    });

_.each(['g', -4, 0, 1, 2, 3, 4, {}], function (n) {
    var index =  until(n);
    if ( index == 3){
        console.log('%s is a positive even number', n);
    } else {
        console.log('"%s" failed at test: %s', n, index);
    }
});

/**
 "g" failed at test: 0
 "-4" failed at test: 1
 0 is a positive even number
 "1" failed at test: 2
 2 is a positive even number
 "3" failed at test: 2
 4 is a positive even number
 "[object Object]" failed at test: 0
 */
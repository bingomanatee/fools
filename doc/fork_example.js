var Fools = require('./../fools');
var _ = require('lodash');

function if_odd(n){
    return (n % 2);
}

function ifPositive(n){
    return n > 0;
}

var test = Fools.fork(ifPositive)
    .then(
    Fools.fork(if_odd)
        .then(function(n){ return 2 * n}).else(_.identity) // if odd
).else(function(){ return 0; }); // if not positive

console.log(_.map(_.range(-5, 6), test));
// result: [ 0, 0, 0, 0, 0, 0, 2, 2, 6, 4, 10 ]
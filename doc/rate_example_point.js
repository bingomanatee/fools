var Fools = require('./../fools');
var _ = require('lodash');
var util = require('util');


var point = {x: 3, y: 4, z: 5};

var rate = Fools.rate()
    .prop('x', function(x){
        return Math.abs(x - point.x);
    }, 1)    .prop('y', function(y){
        return Math.abs(y - point.y);
    }, 1)    .prop('z', function(z){
        return Math.abs(z - point.z);
    }, 1);

var points = _.map(_.range(0, 50), function(){
    return {
        x: Math.round(Math.random() * 10),
        y:  Math.round(Math.random() * 10),
        z:  Math.round(Math.random() * 10)
    }
});

console.log(points);

rate.add(points);

console.log('nearest point to %s: %s', util.inspect(point), util.inspect(rate.worst()));

console.log('within 3  to the point: ', util.inspect(rate.select(0, 3)));
var Fools = require('./../fools');
var _ = require('lodash');
var util = require('util');

var rate = Fools.rate()
    .prop('brains')
    .prop('looks', null, 5);

var peter = {brains: 2, looks: 8, birth_year: 2014 - 45, name: 'Peter Griffin'};
var lois = {brains: 6, looks: 12, birth_year: 2014 - 43, name: 'Lois Griffin'};
var stewie = {brains: 14, looks: 5, birth_year: 2014 - 2, name: 'Stewie Griffin'};
var brian = {brains: 8, looks: 6, birth_year: 2014 - 8, name: 'Brian Griffin'};
var meg = {brains: 4, looks: 3, birth_year: 2014 - 16, name: 'Meg Griffin'};

console.log(' ----------- rating (looks biased) --------- ');

_.each([peter, lois, stewie, brian, meg], function (item) {
    console.log('rating of %s: %s', item.name, rate(item));
    console.log('   (%s * 5 + %s) / %s', item.looks, item.brains, rate.scale());
    rate.add(item);
});

var best = (rate.best());
console.log('best: %s (%s)', best.data.name, best.rating);

var worst = (rate.worst());
console.log('worst: %s (%s)', worst.data.name, worst.rating);

console.log(' ----------- rating (brains biased) --------- ');

var rate2 = Fools.rate()
    .prop('brains', null, 5)
    .prop('looks');

_.each([peter, lois, stewie, brian, meg], function (item) {
    console.log('rating of %s: %s', item.name, rate2(item)); // echoes the rating but doesn't record the candidate
    rate2.add(item); // records the candidate for relative comparison
});

 best = (rate2.best());
console.log('best: %s (%s)', best.data.name, best.rating);

 worst = (rate2.worst());
console.log('worst: %s (%s)', worst.data.name, worst.rating);

console.log(' ----------- rating (age biased) --------- ');

var rate2 = Fools.rate()
    .prop('brains', null, 2)
    .prop('birth_year', function(birth_year){
        return 2014 - birth_year
    }, 3)
    .prop('looks');

_.each([peter, lois, stewie, brian, meg], function (item) {
    console.log('rating of %s: %s', item.name, rate2(item)); // echoes the rating but doesn't record the candidate
    console.log('   (%s * 2 + %s  * 3 + %s) / %s',
        item.brains,
      2014 - item.birth_year,
        item.looks,
        rate.scale());
    rate2.add(item); // records the candidate for relative comparison
});

best = (rate2.best());
console.log('best: %s (%s)', best.data.name, best.rating);

worst = (rate2.worst());
console.log('worst: %s (%s)', worst.data.name, worst.rating);

var should = require('should');
var Fools = require('./../fools');
var _ = require('underscore');

describe('Fools', function () {

    describe('loop', function(){

        var d1sum = 0, d2sum = 0, d3sum = 0;
        before(function(){
          Fools.loop(function(iter){
               d1sum += iter.x;
            }).dim('x', 2, 4)();

           Fools.loop(function(iter){
               d2sum += iter.x + iter.y;
           }).dim('x', 2, 4).dim('y').min(1).max(5)();

            Fools.loop(function(iter){
                d3sum += iter.x ;
            }).dim('x', 10, 20, 5).dim('y', 1, 4, 2)();


        });

        it('should increment along one axis', function(){
            d1sum.should.eql(9, 'sum of 1d iterations');
            d2sum.should.eql(90, 'sum of 2d iterations');
            d3sum.should.eql(90, 'sum by 5s, twice, with an increment');
        })

    });

    /**
     * Rate evaluates candidates based on preprogrammed properties and weights.
     *
     */

    describe('rate', function () {

        var students, math_score, gpa, gpa_flat;

        before(function () {
            students = [
                {name: 'bob', math: 2.0, english: 3.0, pe: 4.0, health: 3.0},
                {name: 'stan', math: 4.0, english: 4.0, pe: 2.0, health: 4.0},
                {name: 'rick', math: 3.5, english: 3.6, pe: 4.0, health: 4.0},
                {name: 'sue', math: 4.0, english: 4.0, pe: 3.5 , health: 3.5}
            ];
            math_score = Fools.rate().prop('math');

            gpa_flat = Fools.rate();
            gpa_flat.property('math');
            gpa_flat.property('english');
            gpa_flat.property('pe');
            gpa_flat.property('health');

            gpa = Fools.rate();
            gpa.property('math').weight(4);
            gpa.property('english').weight(3);
            gpa.property('pe').weight(2);
            gpa.property('health').weight(3);
        });

        it('should rate students on math', function () {
            math_score.rate(students[0]).should.eql(2, 'bob has a 2 math');
            math_score._candidates.length.should.eql(0, 'no candidates added');

            math_score.add(students);
            math_score._candidates.length.should.eql(4, '4 added records');
            math_score.best().data.name.should.eql('sue');
            math_score.worst().data.name.should.eql('bob');

            gpa_flat.rate(students[0]).should.eql(3.0, 'bobs flat gpa == 3.0');

           // var g = gpa.rate(students[2]);
          //  console.log('gpa grade', g);
            gpa.rate(students[0]).should.be.approximately(2.83, 0.01, 'weighted grade for bob -- hurts on the fundamentals');
            gpa.rate(students[1]).should.be.approximately(3.66, 0.01, 'weighted grade for stan -- low PE score doesnt hurt too much');
            gpa.rate(students[2]).should.be.approximately(3.73, 0.01, 'weighted grade for rick -- good but in the wrong things');
            gpa.rate(students[3]).should.be.approximately(3.79, 0.01, 'weighted grade for sue -- high overall');

          //  var g = gpa_flat.rate(students[2]);
        //   console.log('gpa_flat grade', g);
            gpa_flat.rate(students[0]).should.be.approximately(3, 0.01, 'weighted grade for bob -- hurts on the fundamentals');
            gpa_flat.rate(students[1]).should.be.approximately(3.5, 0.01, 'weighted grade for stan -- low PE score doesnt hurt too much');
            gpa_flat.rate(students[2]).should.be.approximately(3.77, 0.01, 'weighted grade for rick -- overall best');
            gpa_flat.rate(students[3]).should.be.approximately(3.75, 0.01, 'weighted grade for sue -- good but not overall best');

            gpa_flat.add(students);
            gpa.add(students);

            gpa_flat.best().data.name.should.eql('rick', 'rick is the best flat gpa');
            gpa.best().data.name.should.eql('sue', 'sue is the best weighted gpa');
        })
    });

    describe('until', function () {

        /**
         * This is an examle of piping the output of until (an index number)
         * into a function that tallies the number of results in each batch.
         */
        describe('batch', function () {

            var bins = [0, 0, 0, 0, 0];
            var binner;
            var range_sorter;

            before(function () {
                function _range_test(from_value, to_value) {
                    var max = Math.max(from_value, to_value);
                    var min = Math.min(from_value, to_value);
                    return function (n) {
                        return  n >= min && n < max;
                        //  if (out)  console.log('testing %s between %s and %s: out', n, min, max, out);
                    }
                }

                range_sorter = Fools.until(function (n) {
                    if (!_.isNumber(n)) {
                        throw new Error('non number')
                    }
                    return false;
                }).err(function () {
                        return 0;
                    })
                    .add(_range_test(-1000000, 5))
                    .add(_range_test(5, 10))
                    .add(_range_test(10, 15))
                    .add(_range_test(15, 1000000));

                binner = Fools.pipe(
                    function (value) {
                        //   console.log('range sorting %s', value);
                        var bin = range_sorter(value);
                        //  console.log('... to %s', bin);
                        return bin;
                    }
                ).add(function (index) {
                        ++bins[index];
                    });

                _.each([0, 2, 10, 100, -100, 60], binner);
            });

            it('should return the right index for bins', function () {
                range_sorter(10).should.equal(3, 'value 10 is sorted to 3');
            })

            it('should be able to tally results into bins', function () {
                bins.should.eql([0, 3, 0, 1, 2], 'bins are sorted output');
            });

        });

        /**
         * This is an example of filtering data
         * through a set of qualifying functions
         * which are responsible for tallying the number of results.
         *
         * If the number is not numeric, the error trapper tallies the result .
         *
         * The output of the processor is ignored.
         */

        describe('filter', function () {

            var whole = 0;
            var zero = 0;
            var negative = 0;
            var errors = 0;

            before(function () {
                var until_nums = Fools.until().add(function (n) {
                    if (!_.isNumber(n)) {
                        throw new Error('not a number');
                    }
                }).add(function (n) {
                        if (n == 0) {
                            ++zero;
                            return true;
                        }
                    }).add(function (n) {
                        if (n > 0) {
                            ++whole;
                            return true;
                        }
                    }).add(function (n) {
                        if (n < 0) {
                            ++negative;
                            return true;
                        }
                    }).
                    err(function (e) {
                        ++errors;
                        return true;
                    });

                until_nums.run(1).run(0).run(5).run(-1).run('foo');
            });

            it('should tally results properly', function () {
                whole.should.equal(2, 'two whole numbers');
                negative.should.equal(1, 'one negative number');
                zero.should.equal(1, 'one zero');
                errors.should.equal(1, 'one error');
            });
        });
    });

    /**
     * Every function in an all chain is executed in order.
     * the functions should not alter the input (use pipe for that).
     * This example shows the result of harvesting several qualities
     * from the same set of data.
     */
    describe('all', function () {

        var right = 0;
        var left = 0;
        var up = 0;
        var down = 0;

        before(function () {

            var q = Fools.all()
                .add(function (c) {
                    if (c.x >= 0) {
                        ++right;
                    }
                }).add(function (c) {
                    if (c.x < 0) {
                        ++left;
                    }
                }).add(function (c) {
                    if (c.y >= 0) {
                        ++up;
                    }
                }).add(function (c) {
                    if (c.y < 0) {
                        ++down;
                    }
                });

            q.run({x: 2, y: -1}).run({x: -4, y: -4}).run({x: 4, y: 4}).run({x: -4, y: -4}).run({x: 4, y: -4});

        });

        it('should tally results', function () {
            right.should.equal(3, 'three right side');
            left.should.equal(2, 'two left side');
            up.should.equal(1, 'one up side');
            down.should.equal(4, 'four down side');
        });
    });

    describe('fork', function () {

        /**
         * This is a simple fork; the then/else functions are
         * responsible for tallying the quality of the data.
         */
        describe('simple fork', function () {
            var positive = 0;
            var negative = 0;
            var errors = 0;

            before(function () {

                var if_positive = Fools.fork(function (n) {
                    if (!_.isNumber(n)) {
                        var e = new Error('non numeric input');
                        e.data = n;
                        throw e;
                    }
                    return n >= 0;

                }).then(function () {
                        ++positive;
                    }).else(function () {
                        ++negative;
                    }).err(function () {
                        ++errors
                    });

                if_positive.run(1).run(0).run(5).run(-1).run('foo');
            });

            it('should tally results', function () {
                positive.should.equal(3, 'three positive numbers');
                negative.should.equal(1, 'one negative number');
                errors.should.equal(1, 'one error');
            })
        });

        /**
         * this is a compound fork
         * -- one of the functions (the then clause)
         * is itself another fork.
         */

        describe('compound fork', function () {

            var whole = 0;
            var zero = 0;
            var negative = 0;
            var errors = 0;

            before(function () {

                var if_positive = Fools.fork(function (n) {
                    if (!_.isNumber(n)) {
                        var e = new Error('non numeric input');
                        e.data = n;
                        throw e;
                    }
                    return n >= 0;

                }).then(
                        Fools.fork(function (n) {
                            return n > 0;
                        }).then(function () {
                                ++whole;
                            }).else(function () {
                                ++zero;
                            })

                    ).else(function () {
                        ++negative;
                    }).err(function () {
                        ++errors
                    });

                if_positive.run(1).run(0).run(5).run(-1).run('foo');
            });

            it('should tally results', function () {

                whole.should.equal(2, 'two whole numbers');
                negative.should.equal(1, 'one negative number');
                zero.should.equal(1, 'one zero');
                errors.should.equal(1, 'one error');
            })
        });

        /**
         * This fork returns the dollar value of the string
         * if it matches the grep.
         * If a non-string is passed in, the result is tallied
         * inside err
         *
         */
        describe('output fork', function () {

            var total = 0;
            var bad = 0;

            before(function () {
                var grep = /\$([\d.]+)/;

                var test = Fools.fork(function (text) {
                    if (!_.isString(text)) {
                        throw new Error('non string passed');
                    }
                    return grep.test(text);
                }).then(function (text) {
                        var m = grep.exec(text);
                        return parseFloat(m[1]);
                    }).else(0).err(function (err) {
                        ++bad;
                        return 0;
                    });

                total = test('$2.00') + test('$5.00') + test([]) + test('$0.15');
            });

            it('should total 7.15', function () {
                total.should.equal(7.15, 'total is 7.15');
            });

            it('should have one bad value', function () {
                bad.should.equal(1, 'one bad');
            });

        });

        describe('fork tree outputting values', function () {
            var members = {}, members_by_name = {};

            before(function () {
                var make_member = function (id, name, likes) {
                    var m = {
                        id:         id,
                        name:       name,
                        likes:      likes,
                        likability: 0
                    };

                    members[id] = m;
                    members_by_name [name] = m;
                    return m;
                };

                make_member(1, 'bob', [2, 3]);
                make_member(2, 'sally', [3, 2]);
                make_member(3, 'jon', [2]);
                make_member(4, 'strange stan', []);
                make_member(4, 'stalker of jon', [3]);

                var ids = _.pluck(_.values(members), 'id');

                var is_friends_with = Fools.fork(function (member, id) {
                    return _.contains(members[id].likes, member.id);
                }).then(4).else(1);

                var is_liked_by = Fools.fork(function (member, id) {
                    return _.contains(members[id].likes, member.id);
                }).then(2).else(0);

                var likes = Fools.fork(function (member, id) {
                    return member.id == id;
                })
                    .then(0) // dont score self references
                    .else(Fools.fork(function (member, id) {
                        return _.contains(member.likes, id);
                    })
                        .then(is_friends_with) // more points for a two way relationship
                        .else(is_liked_by) // points for them liking you, if you don't like them
                    );

                _.each(_.values(members), function (member) {
                    _.each(ids, function (id) {
                        var value = likes(member, id);
                        //     console.log('adding %s to %s likability from relationship with %s', value, member.name, id);
                        member.likability += value;
                    })
                });
            });

            it('should be able to tally likes', function () {
                _.each(members, function (m) {
                    //console.log('member: %s %s likability: %s', m.id, m.name, m.likability);
                });

                members_by_name['strange stan'].likability.should.equal(0, 'strange stan has no friends');
                members_by_name['sally'].likability.should.equal(6, 'sally has 4 friends');
                members_by_name['bob'].likability.should.equal(2, 'bob has two one way likes');
                members_by_name['jon'].likability.should.equal(8, 'jon has two admirers and a friend');
            })
        })

    });

    /**
     * This is an example of pipe
     * which alters and passes a value through
     * each of its component functions.
     */
    describe('pipe', function () {

        var total = 0;

        before(function () {
            var twice_whole_plus_1 = Fools.pipe()
                .add(Math.floor)
                .add(function (n) {
                    return n * 2
                })
                .add(function (n) {
                    return n + 1;
                });
            total = twice_whole_plus_1(2.5) + twice_whole_plus_1(10) + twice_whole_plus_1(Math.PI);
        });

        it('should total 33', function () {
            total.should.equal(33);
        })
    });

    /**
     * Range processing distributes work based
     */
    describe('range', function () {

        var huge = [];
        var hundreds = [];
        var thousands = [];
        var tens = [];
        var ones = [];
        var positive_numbers = [];
        var negative_numbers = [];

        var range_fn = Fools.range();
        range_fn.add_filter(Math.abs);

        var tally_negative = Fools.fork(function (n) {
            return n >= 0
        }).then(function (n) {
                positive_numbers.push(n);
                return n;
            }).else(function (n) {
                negative_numbers.push(n);
                return n;
            });

        range_fn.add(0,function (n, i) {
            ones.push(i);
        }).add(10,function (n, i) {
                tens.push(i);
            }).add(50) // note - adding a no-handler bracket should delegate to the previous handler
            .add(100,function (n, i) {
                hundreds.push(i);
            }).add(1000,function (n, i) {
                thousands.push(i);
            }).add(10000)
            .add_max(function (n, i) {
                huge.push(i);
            });

        var handle_numbers = Fools.pipe(tally_negative, range_fn);

        _.each([1, 10, 20, 30, -1, 0, 4, 1000, 500, -200, -100, -5000, -100000, 2000000, 100235252], handle_numbers);

        /*        console.log('ones: ', ones.join(','));
         console.log('tens: ', tens.join(','));
         console.log('hundreds: ', hundreds.join(','));
         console.log('thousands: ', thousands.join(','));
         console.log('huge: ', huge.join(','));*/

        function _s(v) {
            return _.sortBy(v, _.identity);
        }

        it('should have these ones', function () {
            _s(ones).should.eql([-1, 0, 1, 4]);
        });

        it('should have these tens', function () {
            _s(tens).should.eql(_s([ 10, 20, 30]));
        });

        it('should have these hundreds', function () {
            _s(hundreds).should.eql(_s([500, -200, -100]));
        });

        it('should have these thousands', function () {
            _s(thousands).should.eql(_s([1000, -5000]));
        });

        it('should have these huge', function () {
            _s(huge).should.eql(_s([-100000, 2000000, 100235252]));
        });

        it('should have these positive numbers', function () {
            _s(positive_numbers).should.eql(_s([1, 10, 20, 30, 0, 4, 1000, 500, 2000000, 100235252]));
        });

        it('should have these negative_numbers', function () {
            _s(negative_numbers).should.eql(_s([-1, -200, -100, -5000, -100000]));
        });

    });

});
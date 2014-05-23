var Fools = {
    util: {
        math: {
            sum: function () {
                var args = _.filter(_.toArray(arguments), _isNumber);
                return _.reduce(args, function (o, v) {
                    return o + v
                }, 0);
            }
        },
        add: {
            last: function (out) {
                out.last = function (fn) {
                    out.last_fn = fn;
                    return out;
                }
            },

            run: function (out) {
                out.run = function (input, pipe) {
                    var output = out(input);
                    if (pipe) {
                        pipe(output);
                    }
                    return out;
                }
            },

            err: function (out) {
                out.err = function (fn) {
                    out.if_error = fn;
                    return out;
                }
            },

            add: function (out) {

                out.add = function (test) {
                    if (!out.tests) {
                        out.tests = [];
                    }
                    out.tests.push(test);
                    return out;
                };
                return out;
            }
        }
    }
};


function range() {

    var out = function Range(input) {

        try {
            var value = out.filter ? out.filter(input) : input;
            if (value < out.brackets[0]) {
                if (out.min) {
                    return typeof(out.min) == 'function' ? out.min(value, input) : out.min
                } else {
                    var error = new Error('below minimum bracket');
                    error.data = input;
                    error.value = value;
                    throw error;
                }
            } else if (value >= out.brackets[out.brackets.length - 1] && out.max) {
                return typeof(out.max) == 'function' ? out.max(value, input) : value;
            } else {
                for (var i = 0; i < out.brackets.length; ++i) {
                    var bracket_value = out.brackets[i];
                    var next_bracket = out.brackets[i + 1];
                    if ((value < next_bracket) && (value >= bracket_value )) {
                        var result = _.last(_.compact(out.outcomes.slice(0, i + 1)));
                        if (typeof result == 'function') {
                            return result(value, input, bracket_value, next_bracket);
                        } else {
                            return result;
                        }
                    }
                }

                if (out.max){
                    return (typeof this.max == 'function') ? this.max(value, input) : this.max;
                }

                var range_error = new Error('No brackedted result found');
                range_error.value = value;
                range_error.input = input;
                throw range_error;
            }
        }
        catch (err) {
            if (out.if_error) {
                return out.if_error(err)
            } else {
                throw err;
            }
        }

    };

    out.outcomes = [];
    out.brackets = [];

    out.add = function (value, outcome) {
        out.brackets.push(value);
        out.outcomes.push(outcome);
        return out;
    };

    out.add_min = function (outcome) {
        out.min = outcome;
        return out;
    };

    out.add_max = function (outcome) {
        out.max = outcome;
        return out;
    };

    out.add_filter = function (filter) {
        out.filter = filter;
        return out;
    };

    Fools.util.add.err(out);
    Fools.util.add.run(out);
    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.range = range;
function all() {

    var out = function All(input) {
        var errors = [];
        var output = [];

        for (var i = 0; ( i < out.tests.length); ++i) {
            try {
                output.push(out.tests[i](input));
            }
            catch (err) {
                output.push([null, err]);
                errors.push(err);
            }
        }

        try {
            if (out.last_fn) {
                output.push(out.last_fn(input));
            }
        }
        catch (err) {
            errors.push(err);
        }

        if (errors.length) {
            var error = new Error('error in all');
            error.data = errors;
            if (out.if_error) {
                out.if_error(error);
            } else {
                throw error;
            }
        }
        return output;
    };

    out.tests = [];

    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    Fools.util.add.run(out);
    Fools.util.add.err(out);
    Fools.util.add.last(out);
    Fools.util.add.add(out);
    return out;
}

Fools.all = all;
function rate(){

    /**
     * resemble either rates an object based on its properties
     * or returns the highest rated object amongst a list of candidates.
     * As such you cannot pass a single array and get a single rating -- each of its elements will be rated.
     */
    /**
     *
     * @param name {string | function} used to get the property / quality of the target
     * @param rating {function} (optional) converts the proerty into a numerical rating.
     * @param weight {number} (optional) determines the relevance of the given rating. default 1.
     * @constructor
     */

    function Property(name, rating, weight){
      if (_.isFunction(name)){
          this._get = name;
      } else {
          this.name = name;
      }

      this._rating = rating || _.identity;

      this._weight = weight || 1;
    }

    Property.prototype = {
        rate: function(item){
            var base = this.base(item);
            var rating = this.get_rating()(base, item, out);
            var weight = this.get_weight();
            if (!_.isNumber(rating)){
                throw new Error('not a number rating');
            } else if (!_.isNumber(weight)){
                throw new Error('not a number weight');
            }
            return rating * weight;
        },
        base: function(item){
            return (this._get) ? this._get(item, out) : item[this.name];
        },
        weight: function(value){
            this._weight = value;
            return this;
        },
        rating: function(rating){
            this._rating = rating;
            return this;
        },
        get_weight: function(){
            return this._weight;
        },
        get_rating: function(){
            return this._rating;
        }
    };

    function out(data){
        if (_.isArray(data)){
            return _.map(data, function(item){
                return {rating: out.rate(item), data: item};
            });
        } else {
            return out.rate(data);
        }
    }

    out.properties = [];

    out._candidates = [];

    out.scale = function(){
        return _.reduce(out.properties, function(v, prop){
            return v + prop.get_weight();
        } ,0)
    };

    out.rate = function(target){
        var rating = 0;
        _.each(out.properties, function(property){
            rating += property.rate(target);
        });
        return rating/out.scale();
    };

    out.best = function(){
        return _.last(_.sortBy(out._candidates, 'rating'));
    };

    out.worst = function(){
        return _.first(_.sortBy(out._candidates, 'rating'));
    };

    out.select = function(min, max, inclusive){
        return _.filter(out._candidates, function(candidate){
            return candidate.rating >= min && ((inclusive) ? candidate.rating <= max : candidate.rating < max);
        });
    };

    /**
     * adds one or more items to the list of candidates of out
     * and returns the result.
     *
     * @param data
     * @returns {*}
     */
    out.add = function(data){
        if (_.isArray(data)){
            var results =  _.map(data, function(item){
                return({rating: out.add(item), data: item});
            });
            return results;
        } else {
            var rating = out.rate(data);
            out._candidates.push({rating: rating, data: data});
            return rating;
        }
    };

    /**
     * Prop and Property are identical except property returns the property object.
     *
     * @param param {string|function}
     * @param rating {function} (optional)
     * @param weight {number > 0} (optional)
     * @returns {out}
     */

    out.prop = function(param, rating, weight){
        var prop = new Property(param, rating, weight);
        out.properties.push(prop);
        return out;
    };

    out.property = function(param, rating, weight){
        var prop = new Property(param, rating, weight);
        out.properties.push(prop);
        return prop;
    };

    return out;

};

Fools.rate = rate;
function loop(iterator) {

    var out = function (memo) {
        var dims = [];
        var args = _.toArray(arguments);

        if (args.length < 2) {
            dims = _.keys(out.dims);
        } else {
            _.each(args.slice(1), function (dim) {
                if (out.dims.hasOwnProperty(dim)) {
                    dims.push(dim);
                }
            });
        }

        var iterator = {};
        _.each(dims, function (dim) {
            iterator[dim] = _min(dim);
        });

        var done = false;

        while (!done) {
            memo = out.iterator(iterator, memo, out);

            var dim_index = 0;
            var next = false;
            while ((!next) && (dim_index < dims.length)) {
                var dim = dims[dim_index];
                var inc = _inc(dim);
                if (iterator[dim] + inc <= _max(dim, iterator)) {
                    iterator[dim] += inc;
                    next = true;
                } else {
                    iterator[dim] = _min(dim, iterator);
                    ++dim_index;
                }
            }
            done = !next;
        }

        return memo;
    };

    out.place = Fools.fork(function(dim, iterator){
      //  console.log('_min %s: %s, iterator %s', dim, _min(dim, iterator), iterator[dim]);
        return _min(dim, iterator) == iterator[dim];
    }).then('first').else(Fools.fork(function(dim, iterator){
            return _max(dim, iterator) == iterator[dim];
        }).then('last').else('middle'));

    function _min(dim, iterator){
        if (typeof(dim)!= 'string'){
            throw new Error(require('util').format(
                'non string dim passed to min: %s,', require('util').inspect(dim)));
        }
        return typeof(out.dims[dim].min) == 'function' ? out.dims[dim].min(iterator) : out.dims[dim].min;
    }
    function _max(dim, iterator){
        return typeof(out.dims[dim].max) == 'function' ? out.dims[dim].max(iterator) : out.dims[dim].max;
    }

    function _inc(dim, iterator){
        return typeof(out.dims[dim].inc) == 'function' ? out.dims[dim].inc(iterator) : out.dims[dim].inc;

    }

    out.dims = {};

    out.iterator = iterator;

    out.dim = function (name, min, max, inc) {
        if (!out.dims[name]) {
            out.dims[name] = {min: min || 0, max: max || 0, inc: inc || 1};
        }

        out._last_dim = name;
        return out;
    };

    out.max = function (max, dim) {
        if (!dim) {
            dim = out._last_dim;
        } else {
            out._last_dim = dim;
        }

        out.dim(dim).dims[dim].max = max;

        return out;
    };

    out.min = function (min, dim) {
        if (!dim) {
            dim = out._last_dim;
        } else {
            out._last_dim = dim;
        }

        out.dim(dim).dims[dim].min = min;

        return out;
    };

    out.inc = function(inc, dim){
        if (!dim){
            dim = _last_dim.last_dim;
        } else {
            out._last_dim = dim;
        }
    }

    return out;
};

Fools.loop = loop;
function pairs(test, multi) {

    if (!test) {
        test = function (a, b) {
            return a === b;
        }
    }

    var out = function Pairs(setOne, setTwo) {
        setOne = setOne.slice(0);
        setTwo = setTwo.slice(0);

        var pairs = [];

        if (!(_.isArray(setOne) && _.isArray(setTwo))) {
            throw ('comparators must be arrays;')
        }

        if (!(setOne.length && setTwo.length)) {
            // console.log('one of the arrays is empty -- returning empty array');
            return [];
        }

        _.each(setOne, function (oneItem) {
            var matches = [];
            var complete = false;
            var finds = [];

            for (var i = 0; i < setTwo.length && !complete; ++i) {
                var candidate = setTwo[i];
                if (test(oneItem, candidate)) {
                    finds.push(i);
                    matches.push(candidate);
                    if (!multi) {
                        complete = true;
                    }
                }
            }

            finds.reverse();
            for (var f = 0; f < finds.length; ++f){
                setTwo.splice(finds[f],1);
            }

            if (matches.length) {
                if (multi) {
                    pairs.push([oneItem, matches])
                }
                else {
                    pairs.push([oneItem, _.first(matches)]);
                }
            }
        });

        return pairs;
    };

    return out;
}

Fools.pairs = pairs;
function each() {

    var out = function Each(input) {
        var errors = [];
        var result = true;

        for (var i = 0; (result && (!errors.length)) && ( i < out.tests.length); ++i) {
            try {
                if (!out.tests[i](input)) {
                    result = false;
                }
            } catch (err) {
                errors.push(err);
            }
        }

        try {
            if (result && (!errors.length) && out.last_fn) {
                if (!out.last_fn(input)) {
                    result = false;
                }
            }
        } catch (err) {
            errors.push(err);
        }

        if (errors.length) {
            var error = new Error('error in each');
            error.data = errors;
            if (out.if_error) {
                out.if_error(error);
            } else {
                throw error;
            }
        }
        return result;
    };

    out.tests = [];

    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    Fools.util.add.run(out);
    Fools.util.add.err(out);
    Fools.util.add.last(out);
    Fools.util.add.add(out);
    return out;
}

Fools.each = each;

function pipe() {

    var out = function Pipe() {
        var input = _.toArray(arguments);
        for (var i = 0; ( i < out.tests.length); ++i) {
            try {
                input = i ? out.tests[i](input) : out.tests[i].apply(out.tests[i], input)
            }
            catch (err) {
                if (out.if_error) {
                    out.if_error(err);
                } else {
                    throw err;
                }
            }
        }

        return input;
    };

    out.tests = [];

    Fools.util.add.run(out);
    Fools.util.add.err(out);
    Fools.util.add.last(out);
    Fools.util.add.add(out);
    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.pipe = pipe;
function gauntlet() {

    /**
     *
     * if no test is valid, then gauntlet will throw an error.
     *
     * test functions have the profile
     *
     * testFn(input, isGood)
     *
     * if the test is positive, call isGood();
     *
     * The result of gauntlet will be the output of the first test function
     * for which isGood is called.
     *
     * @param input
     * @returns {*}
     * @constructor
     */

    var out = function Gauntlet(input) {
        try {
            for (var i = 0; i < out.tests.length; ++i) {
                var good = false;
                function isGood(){
                    good = true;
                }
                var result = out.tests[i](input, isGood);
                if (good) {
                    return result;
                }
            }
        } catch (err) {
            if (out.if_error) {
                return out.if_error(err);
            } else {
                throw err;
            }
        }

        if (out.last_fn) {
            return out.last_fn(input);
        } else {
            throw 'All tests failed';
        }
    };

    out.tests = [];

    Fools.util.add.add(out);
    Fools.util.add.err(out);
    Fools.util.add.run(out);
    Fools.util.add.last(out);
    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.gauntlet = gauntlet;

/**
 * the definition class for a single coordinate system
 * @param name {string}
 * @param params {Object}
 * @param frame {Frame}
 * @constructor
 */
function Def(name, params, frame) {
    this.reversed = [];
    this.axes = {
    };
    this.clamp = false;
    this.name = name;

    if (params) {
        _.extend(this, params);
    }

    if (params.template) {
        _.extend(this, Def.TEMPLATES[params.template]);
    }

    /* the reson they are given in a redundant array
     *  is that if array input
     *  it is necessary to have a strict definition of expected ordering
     */
    if (!this.dimensions) {
        this.dimensions = _.keys(this.axes);
    }

    this.name = name;
    this.frame = frame;

    //@TODO: validate sensibility of axes' range
}

Def.prototype = {

    arrayToObject: function(input) {
        return  _.reduce(input, function(out, value, index) {
            if (index < this.dimensions.length) {
                out[this.dimensions[index]] = value;
            }
            return out;
        }, {}, this);
    },

    vector: function() {
        return _.reduce(this.dimensions, function(norm, axis) {
            norm[axis] = 0;
            return norm;
        }, {});
    },

    /**
     * convenience function for describing definition's extent.
     * @returns {Mixed|*}
     */

    min: function() {
        return _.reduce(this.axes, function(min, value, dimension) {
            min[dimension] = value[0];
            return min;
        }, {});
    },

    max: function() {
        return _.reduce(this.axes, function(min, value, dimension) {
            min[dimension] = value[1];
            return min;
        }, {});
    },

    center: function() {
        return _.reduce(this.axes, function(center, value, dimension) {
            center[dimension] = (value[0] + value[1]) / 2;
            return center;
        }, {}, this);
    },

    range: function(dimension) {
        return this.axes[2] || (this.axes[2] == this.axes[1] - this.axes[0]);
    },

    denormalize: function(input, clamp) {

        if (arguments.length < 2) {
            clamp = this.clamp
        }
        if (_.isArray(input)) {
            input = this.arrayToObject(input);
        }

        var result = this.vector();

        return _.reduce(input, function(result, value, dimension) {
            if (!this.axes[dimension]) { // any axis not in the frame of reference is ignored.
                return result;
            }
            var range = this.axes[dimension] || this.range(dimension);
            if (!range[2]) {
                range[2] = range[1] - range[0]; // lazily cache the extent of the range;
            }

            if (this.reversed.length && _.contains(this.reversed, dimension)) {
                value = 1 - value;
            }

            var denormalized = (value * range[2]) + range[0];

            if (clamp) {
                denormalized = Math.max(range[0], Math.min(range[1], denormalized));
            }

            result[dimension] = denormalized;
            return result;
        }, result, this);
    },

    /**
     * return all values to a 0..1 range
     * @param input {array|Object} either an array of input or an obect whose key/values correspond to the axes defintion.
     * @param clamp {boolean} (optional) overrides the default clamping of the coordinate system
     * @returns {Object}
     */
    normalize: function(input, clamp) {

        if (arguments.length < 2) {
            clamp = this.clamp
        }
        if (_.isArray(input)) {
            input = this.arrayToObject(input);
        }

        var result = this.vector();

        return _.reduce(input, function(result, value, dimension) {
            if (!this.axes[dimension]) { // any axis not in the frame of reference is ignored.
                return result;
            }
            var range = this.axes[dimension] || this.range(dimension);
            if (!range[2]) {
                range[2] = range[1] - range[0]; // lazily cache the extent of the range;
            }

            var normalized = (value - range[0]) / range[2];

            if (clamp) {
                normalized = Math.max(0, Math.min(1, normalized));
            }

            if (this.reversed.length && _.contains(this.reversed, dimension)) {
                normalized = 1 - normalized;
            }

            result[dimension] = normalized;
            return result;
        }, result, this);
    }
};

Fools.FOR_Def = Def;

/**
 * Some known coordinate systems
 */

Def.TEMPLATES = {
    'screenDom': { // this is the DOM space -- 2d, y axis down
        axes: {
            x: [0, (typeof(window) == 'undefined') ? 1024 : window.innerWidth],
            y: [0, (typeof(window) == 'undefined') ? 768 : window.innerHeight]
        },
        params: ['x', 'y'],
        reversed: ['y']
    },
    'leapLeft': {
        axes: {
            x: [-125, 40],
            y: [180, 250],
            z: [-80, 110]
        },
        dimensions: ['x', 'y', 'z']
    },

    'leapRight': {
        axes: {
            x: [-40, 125],
            y: [108, 250],
            z: [-80, 110]
        }
    },
    'leapMiddle': {
        axes: {
            x: [-80, 89],
            y: [108, 250],
            z: [-80, 110]
        }
    }
};

Fools.FOR_watchResize = function() {
    if (!Fools.FOR_watchResizeStarted) {

        if (typeof(window) != 'undefined') {

            window.addEventListener('resize', function() {
                Def.TEMPLATES.screenDom.axes.x[1] = Def.TEMPLATES.screenDom.axes.x[2] = window.innerWidth;
                Def.TEMPLATES.screenDom.axes.y[1] = Def.TEMPLATES.screenDom.axes.y[2] = window.innerHeight;
            }, false);

            Fools.FOR_watchResizeStarted = true;
        }

    }
};

Fools.frameOfReference = function() {

    /**
     * a namespace of definitions which can be translated between each other
     *
     * @constructor
     */
    function Frame() {

        this._defs = {};
    }

    Frame.prototype = {
        addDef: function(name, params) {
            if (this._defs[name]) throw "duplicate def for " + name;
            var def = new Fools.FOR_Def(name, params, this);
            this._defs[name] = def;
            return def;
        },

        def: function(name) {
            return this._defs[name];
        },

        normalize: function(system, input) {
            if (!this._defs[system]) {
                throw "cannot find def " + system;
            }

            var args = _.toArray(arguments).slice(1);
            return this._defs[system].normalize.apply(this._defs[system], args)
        },

        denormalize: function(system, input) {

            if (!this._defs[system]) {
                throw "cannot find reference " + system;
            }
            var args = _.toArray(arguments).slice(1);
            return this._defs[system].denormalize.apply(this._defs[system], args)
        },

        translate: function(fromSystem, toSystem, input) {
            var normalized, result;

            if (_.isArray(fromSystem)) { // passing [system, clamp] as array
                normalized = this.normalize(fromSystem[0], input, fromSystem[1]);
            } else {
                normalized = this.normalize(fromSystem, input); // forced to use default clamping
            }

            if (_.isArray(toSystem)) {
                result = this.denormalize(toSystem[0], normalized, toSystem[1]);
            } else {
                result = this.denormalize(toSystem, normalized);
            }

            return result;
        },

        /**
         * takes an object in the 0..1 space and translates it into the -1 ... 1 space
         * @param input
         */
        normalizedToOrigin: function(input) {
            return _.reduce(input, function(out, value, key) {
                out[key] = 2 * (value - 1);
                return out;
            }, {});
        }
    };

    return new Frame();
};

function until() {

    var out = function Until(input) {
        var result = null;
        var i;
        for (i = 0; (!result) && ( i < out.tests.length); ++i) {
            try {
                result = out.tests[i](input);
                if (result) return i;
            }
            catch (err) {
                if (out.if_error) {
                    result = out.if_error.call(out, err, input);
                } else {
                    throw err;
                }
            }
        }

        if (!result) {
            try {
                if (!out.if_last || !out.if_last(input)) {
                    error = new Error('no handler for data');
                    error.data = input;
                    throw error;
                }
            }
            catch (err) {
                if (err.message == 'no handler for data') {
                    throw err;
                } else if (out.if_error) {
                    out.if_error(err);
                } else {
                    throw err;
                }
            }
        }
        return i;
    };

    out.tests = [];

    Fools.util.add.add(out);
    Fools.util.add.err(out);
    Fools.util.add.run(out);
    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.until = until;
function fork(test, if_true, if_false, if_error) {

    var out = function Fork() {
        var args = Array.prototype.slice.call( arguments);
        try {
            if (out.test.apply(out, args)) {
                return typeof(out.if_true) == 'function' ? out.if_true.apply(out, args) : out.if_true;
            } else {
                return typeof(out.if_false) == 'function' ? out.if_false.apply(out, args) : out.if_false;
            }
        } catch (err) {
            if (out.if_error) {
                return out.if_error.call(out, err);
            } else {
                throw err;
            }
        }

    };

    out.test = test;
    out.if_true = if_true;
    out.if_false = if_false;
    out.if_error = if_error;

    out.then = function (fn) {
        out.if_true = fn;
        return out;
    };

    out.else = function (fn) {
        out.if_false = fn;
        return out;
    };

    Fools.util.add.run(out);
    Fools.util.add.err(out);

    return out;

}

Fools.fork = fork;
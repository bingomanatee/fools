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

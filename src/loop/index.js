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
                if (iterator[dim] < _max(dim, iterator)) {
                    ++iterator[dim];
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

    out.dims = {};

    out.iterator = iterator;

    out.dim = function (name, min, max) {
        if (!out.dims[name]) {
            out.dims[name] = {min: min || 0, max: max || 0};
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

    return out;
};

Fools.loop = loop;
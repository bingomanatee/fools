var Fools = {

};


function all() {

    var out = function Until(input) {
        try {
            out.do(input);
        }
        catch (err) {
            if (out.if_error) {
                out.if_error.call(out, err);
            } else {
                throw err;
            }
        }
        return out;
    };

    out.tests = [];

    out.add = function (test) {
        out.tests.push(test);
        return out;
    };

    out.err = function (fn) {
        out.if_error = fn;
        return out;
    };

    out.last = function (fn) {
        out.if_last = fn;
        return out;
    }

    out.do = function (input) {
        var errors = [];
        try {
            for (var i = 0;  ( i < out.tests.length); ++i){
                out.tests[i](input);
            }
        }
        catch (err) {
            errors.push(err);
        }
        if (errors.length){
            var error = new Error('error in all');
            error.data = errors;
            if (out.if_error){
                out.if_error(error);
            } else {
                throw error;
            }
        }
    };


    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.all = all;
function until() {

    var out = function Until(input) {
        try {
            out.do(input);
        }
        catch (err) {
            if (out.if_error) {
                out.if_error.call(out, err);
            } else {
                throw err;
            }
        }
        return out;
    };

    out.tests = [];

    out.add = function (test) {
        out.tests.push(test);
        return out;
    };

    out.err = function (fn) {
        out.if_error = fn;
        return out;
    };


    out.do = function (input) {
        var result = null;
        try {
            for (var i = 0; (!result) && ( i < out.tests.length); ++i) {
                result = out.tests[i](input);
            }
        }
        catch (err) {
            console.log('until error: ', err);
            if (out.if_error) {
                out.if_error.call(out, err);
                result = true;
            } else {
                throw err;
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
    };

    for (var i = 0; i < arguments.length; ++i) {
        out.add(arguments[i]);
    }

    return out;
}

Fools.until = until;
function fork(test, if_true, if_false, if_error){

    var out = function Fork(input){
        try {
            if (out.test.call(out, input)){
                 out.if_true.call(out, input);
            } else {
                 out.if_false.call(out, input);
            }
        } catch(err){
           if( out.if_error){
               out.if_error.call(out, err);
           } else {
               throw err;
           }

        }
        return out;
    };

    out.test = test;
    out.if_true = if_true;
    out.if_false = if_false;
    out.if_error = if_error;

    out.next = function(data){
       return out(data);
    };

    out.then = function(fn){
        out.if_true = fn;
        return out;
    };

    out.else = function(fn){
        out.if_false = fn;
        return out;
    }

    out.err = function(fn){
        out.if_error = fn;
        return out;
    }

    return out;

}

Fools.fork = fork;
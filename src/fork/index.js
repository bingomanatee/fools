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
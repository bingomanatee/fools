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
            return this.rate(data);
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
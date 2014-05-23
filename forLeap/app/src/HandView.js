define(function(require, exports, module) {

    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');
    var View = require('famous/core/View');
    var _ = require('./lodash');
    var Fools = require('./fools');

    var frame = Fools.frameOfReference();

    Fools.FOR_watchResize();

    frame.addDef('screen', {template: 'screenDom'});
    frame.addDef('leapLeft', {template: 'leapLeft'});
    frame.addDef('leapRight', {template: 'leapRight'});

    var id = 0;

    function HandView(leapHand, options) {
        this.handId = leapHand.id;
        this.initialHand = leapHand;
        View.call(this, _.defaults({}, options, HandView.DEFAULTS));

        this.initFingers(leapHand);
        this.updateFingers(leapHand);
    }

    HandView.DEFAULTS = {
        side: 'left'
    };

    var FINGER_SIZE = 40;

    HandView.prototype = Object.create(View.prototype);

    HandView.prototype.initFingers = function(hand) {
        this.fingers = _.map(hand.fingers, function(finger) {
            var mod = new Modifier({origin: [0.5, 0.5]});
            var node = this._node.add(mod);
            var surface = new Surface({
                classes: ['leap-finger'],
                size: [FINGER_SIZE * 2, FINGER_SIZE],
                content: finger.id + '/' + hand.id
            });
            surface.fingerId = finger.id;
            surface.node = node;
            surface.mod = mod;
            node.add(surface);
            return surface;
        }, this);

        this.normalizedFingers = _.map(hand.fingers, function(finger) {
            var mod = new Modifier({origin: [0, 0]});
            var node = this._node.add(mod);
            var surface = new Surface({
                classes: ['leap-finger', 'normalized', hand.type ],
                size: [FINGER_SIZE * 2, FINGER_SIZE],
                content: '(' + finger.id + '/' + hand.id + ')',

            });

            surface.fingerId = finger.id;
            surface.node = node;
            surface.mod = mod;
            node.add(surface);

            return surface;
        }, this);

    };

    HandView.prototype.destroyMe = function() {
        if (this.contextNode) {
            this.contextNode._object = this.contextNode._child = null;
            this.contextNode._isRenderable = this.contextNode._isModifier = false;
        }
    };

    HandView.prototype.updateFingers = function(hand) {
        var ht = hand.type == 'left' ? 'leapLeft' : 'leapRight';
        for (var i = 0; i < hand.fingers.length; ++i) {
            var handFinger = hand.fingers[i];
            var stp = handFinger.stabilizedTipPosition;

            var surfaceFinger = this.getFinger(handFinger.id);
            if (surfaceFinger) {
                surfaceFinger.mod.setTransform(Transform.translate(stp[0], stp[1], stp[2]));
            } else {
                throw "Cannot find finger " + handFinger.id;
            }

            var normFinger = this.getFinger(handFinger.id, true);

            if (normFinger){
                var norm = frame.translate(ht, 'screen', stp);
                console.log('norm:', norm);

                normFinger.mod.setTransform(Transform.translate(norm.x, norm.y, 0));
            }
        }
    };

    HandView.prototype.getFinger = function(id, n) {
        var finger = false;
        var base = n ? this.normalizedFingers : this.fingers;

        for (var i = 0; (!finger) && i < (base.length); ++i) {
            if (base[i].fingerId == id) {
                finger = base[i];
            }
        }
        return finger;
    };

    module.exports = HandView;
});

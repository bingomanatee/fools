/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var HandView = require('./HandView');

    // create the main context
    var mainContext = Engine.createContext();
    mainContext.setPerspective(400);

    // your app here
    var logo = new ImageSurface({
        size: [400, 200],
        content: '/content/images/leapLogo.png',
        classes: ['backfaceVisibility']
    });

    var initialTime = Date.now();
    var centerSpinModifier = new Modifier({
        origin: [0.5, 0.5],
        transform: function() {
            return Transform.rotateY(.002 * (Date.now() - initialTime));
        }
    });

    mainContext.add(centerSpinModifier).add(logo);

    var hands = [];

    function _findOrMakeHand(hand) {
        var oldHand = _.find(hands, function(oh) {
            return oh.handId == hand.id;
        });

        if (oldHand) {
            return oldHand;
        }

        var newHand = new HandView(hand);
        newHand.contextNode = mainContext.add(newHand);
        hands.push(newHand);
        return newHand;
    }

    Leap.loop(function(frame) {

        var newHands = [];
        _.each(frame.hands, function(hand) {
            var famousHand = _findOrMakeHand(hand);
            if (famousHand){
                try {
                    famousHand.updateFingers(hand);
                } catch(err){
                    console.log('errr in updateFingers');
                    famousHand.updateFingers(hand);
                }
                newHands.push(famousHand);
            }
        });

        _.each(hands, function(hand){

            if (!_.find(newHands, function(nh){
                return nh.handId == hand.handId;
            })){
                hand.destroyMe();
            }

        });

       hands = newHands;
    });
});

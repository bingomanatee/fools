function _findOrMakeHand(hand){
    var oldHand = _.find(hands, function(oh){
        return oh.id == hand.id;
    });

    if (oldHand) {
        return oldHand;
    }

    var newHand = new HandView(hand);
    mainContext.add(newHand);
    hands.push(hand);
    return newHand;
}

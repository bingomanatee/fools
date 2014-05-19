## Fools.pairs

Fools.pairs takes two arrays (sets) and returns matched pairs, where the first array element is a member of the first set
and the second element is a member of the second set. (or, if multi-matching is possible, an array of all matching members
of the second set.)

Pairing is reductive -- once a member of set two is paired, is is removed as a candidadate. So, while (if multi is true)
one element of set one can match many elements of set two, each element of set two can match one (or zero) elements
of set one.

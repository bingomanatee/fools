
## Fools.all

Fools.all calls each function in its roster with the input value. They are called in order
and any errors emitted by a function are trapped and emitted as one composite error.

Like `until` there is a `my_all.last(last_fn)` method that is always done after the added methods.

Fools.all is (barring errors) functionally identical to map.

```javsacript
var my_all = Fools.all(fn_a, fn_b, fn_c...)
```

and/or

```javascript
var my_all = Fools.all().add(fn_a).add(fn_b).add(fn_c)...

```

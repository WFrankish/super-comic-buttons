"use strict";
// this is basically linq
class MyArray extends Array {
    constructor(...args) {
        if (args.length == 1 && typeof args[0] === "number") {
            super();
            this.push(args[0]);
        }
        else {
            super(...args);
        }
    }
    any(func) {
        return this.count(func) > 0;
    }
    count(func) {
        var filtered = this.where(func);
        return filtered.length;
    }
    first(func) {
        var filtered = this.where(func);
        return filtered[0];
    }
    last(func) {
        var filtered = this.where(func);
        return filtered[filtered.length - 1];
    }
    // select and where are already implemented as map and filter, but when I realised
    // and replaced them it acted weird so whatever
    select(func) {
        if (typeof func !== "function") {
            return this;
        }
        var res = new MyArray();
        this.forEach(val => res.push(func(val)));
        return res;
    }
    where(func) {
        if (typeof func !== "function") {
            return this;
        }
        var res = new MyArray();
        this.forEach(val => {
            if (func(val)) {
                res.push(val);
            }
        });
        return res;
    }
    remove(item) {
        for (var i = 0; i < this.length; i++) {
            if (item == this[i]) {
                this.splice(i, 1);
                return;
            }
        }
    }
    shuffled() {
        var res = new MyArray(...this);
        for (var i = res.length - 1; i > 0; i--) {
            var j = Math.trunc(Math.random() * (i + 1));
            var temp = res[i];
            res[i] = res[j];
            res[j] = temp;
        }
        return res;
    }
    toSource() {
        return `(new Feed(${super.toSource()}))`;
    }
}
//# sourceMappingURL=my-array.js.map
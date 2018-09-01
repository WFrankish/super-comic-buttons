"use strict";
class MyArray extends Array {
    constructor(...array) {
        if (array.length == 1) {
            // array constructor does something different when given a single number
            // avoid that
            super();
            this.push(array[0]);
        }
        else {
            super(...array);
        }
    }
    select(func) {
        var result = this.map(func);
        return new MyArray(...result);
    }
    selectMany(func) {
        var results = this.select(func);
        var concat = new MyArray();
        results.forEach(arr => {
            concat.push(...arr);
        });
        return concat;
    }
    where(func) {
        // filter has weird behaviour, possibly because we're extending array
        // if you filter out all members, it returns an array containing a 0
        // so we'll just reimplement it
        var result = [];
        this.forEach(t => {
            if (func(t)) {
                result.push(t);
            }
        });
        return new MyArray(...result);
    }
    count(func) {
        if (func !== undefined) {
            return this.where(func).count();
        }
        else {
            return this.length;
        }
    }
    any(func) {
        if (func !== undefined) {
            return this.some(func);
        }
        else {
            return this.length > 0;
        }
    }
    all(func) {
        return this.every(func);
    }
    singleOrDefault(func) {
        if (func !== undefined) {
            return this.where(func).single();
        }
        else {
            if (this.length == 1) {
                return this[0];
            }
            else {
                return null;
            }
        }
    }
    single(func) {
        var result = this.singleOrDefault(func);
        if (result == null) {
            throw new Error('Invalid operation.');
        }
        else {
            return result;
        }
    }
    firstOrDefault(func) {
        if (func !== undefined) {
            let length = this.length;
            for (let ii = 0; ii < length; ii++) {
                if (func(this[ii])) {
                    return this[ii];
                }
            }
            return null;
        }
        else {
            if (this.length > 0) {
                return this[0];
            }
            else {
                return null;
            }
        }
    }
    first(func) {
        if (func !== undefined) {
            let length = this.length;
            for (let ii = 0; ii < length; ii++) {
                if (func(this[ii])) {
                    return this[ii];
                }
            }
            throw new Error('Invalid operation.');
        }
        else {
            if (this.length > 0) {
                return this[0];
            }
            else {
                throw new Error('Invalid operation.');
            }
        }
    }
    lastOrDefault(func) {
        if (func !== undefined) {
            return this.where(func).lastOrDefault();
        }
        else {
            if (this.length > 0) {
                return this[this.length - 1];
            }
            else {
                return null;
            }
        }
    }
    last(func) {
        if (func !== undefined) {
            return this.where(func).last();
        }
        else {
            if (this.length > 0) {
                return this[this.length - 1];
            }
            else {
                throw new Error('Invalid operation.');
            }
        }
    }
    shuffle() {
        var results = new MyArray(...this);
        for (let ii = results.length; ii > 0; ii--) {
            var rand = Math.trunc(Math.random() * ii);
            var temp = results[rand];
            results[rand] = results[ii - 1];
            results[ii - 1] = temp;
        }
        return results;
    }
    distinct(func) {
        var results = [];
        this.forEach(t => {
            if (func !== undefined) {
                if (results.findIndex(t2 => func(t, t2)) < 0) {
                    results.push(t);
                }
            }
            else {
                if (results.indexOf(t) < 0) {
                    results.push(t);
                }
            }
        });
        return new MyArray(...results);
    }
    except(...exceptions) {
        return this.where(t => exceptions.indexOf(t) < 0);
    }
    drop(n) {
        var results = this.slice(n);
        return new MyArray(...results);
    }
    contains(t) {
        return this.any(t2 => t2 == t);
    }
}
function selectAsMyArray(array, func) {
    var result = array.map(func);
    return new MyArray(...result);
}
//# sourceMappingURL=my-array.js.map
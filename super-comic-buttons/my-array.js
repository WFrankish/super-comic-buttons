"use strict";
class MyArray extends Array {
    static lastOrDefault(array) {
        if (array.length > 0) {
            return array[array.length - 1];
        }
        else {
            return null;
        }
    }
    static last(array) {
        if (array.length > 0) {
            return array[array.length - 1];
        }
        else {
            throw new Error('Invalid operation.');
        }
    }
    static shuffle(array) {
        var results = [...array];
        for (let ii = results.length; ii > 0; ii--) {
            var rand = Math.trunc(Math.random() * ii);
            var temp = results[rand];
            results[rand] = results[ii - 1];
            results[ii - 1] = temp;
        }
        return results;
    }
}

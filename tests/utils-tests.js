"use strict";
QUnit.module("utils");
QUnit.test("pluralise", function (assert) {
    var actual = Utils.pluralise(1, "bee");
    assert.equal(actual, "1 bee");
    actual = Utils.pluralise(2, "bee");
    assert.equal(actual, "2 bees");
    actual = Utils.pluralise(0, "fish", "fishes");
    assert.equal(actual, "0 fishes");
});
QUnit.test("as time string", function (assert) {
    var actual = Utils.asTimeString(5000, 0);
    assert.equal(actual, "no time");
    actual = Utils.asTimeString(0, 5);
    assert.equal(actual, "no time");
    actual = Utils.asTimeString(1540850656835, 1);
    assert.equal(actual, "48 years");
    actual = Utils.asTimeString(1540850656835, 10);
    assert.equal(actual, "48 years, 44 weeks, 5 days, 22 hours, 4 minutes, 16 seconds, 835 milliseconds");
    actual = Utils.asTimeString(656835, 10);
    assert.equal(actual, "10 minutes, 56 seconds, 835 milliseconds");
});
//# sourceMappingURL=utils-tests.js.map
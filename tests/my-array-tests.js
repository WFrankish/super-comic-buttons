"use strict";
QUnit.module("my-array");
QUnit.test("lastOrDefault", function (assert) {
    var base = [1, 2, 3, 4];
    var actual = MyArray.lastOrDefault(base);
    assert.deepEqual(actual, 4);
    var actualEmpty = MyArray.lastOrDefault([]);
    assert.deepEqual(actualEmpty, null);
});
QUnit.test("last", function (assert) {
    var base = [1, 2, 3, 4];
    var actual = MyArray.last(base);
    assert.deepEqual(actual, 4);
    try {
        MyArray.last([]);
        assert.notOk(true);
    }
    catch (e) {
        assert.ok(true);
    }
    var nullArray = [null, null, null];
    var actualNull = MyArray.last(nullArray);
    assert.deepEqual(actualNull, null);
});
QUnit.test("shuffle", function (assert) {
    var base = [1, 2, 3, 4];
    var shuffled = MyArray.shuffle(base);
    assert.notEqual(shuffled, base);
});
//# sourceMappingURL=my-array-tests.js.map
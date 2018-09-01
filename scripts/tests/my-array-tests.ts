QUnit.module("my-array");
QUnit.test("constructor", function ( assert: Assert) {
    var emptyExpect: any[] = [];
    var emptyActual = new MyArray();
    assert.deepEqual(emptyActual, emptyExpect);

    var numExpect = [1, 2, 3];
    var numActual = new MyArray(...numExpect);
    assert.deepEqual(numActual, numExpect);

    var singletonExpect = [5];
    var singletonActual = new MyArray(...singletonExpect);
    assert.deepEqual(singletonActual, singletonExpect, "singleton array parameter");
});

QUnit.test("select", function (assert: Assert) {
    var base = [[1], [1, 2, 3], [4, 5]];
    var expected = [1, 3, 2];
    var actual = new MyArray(...base).select(a => a.length);
    assert.deepEqual(actual, expected)
});

QUnit.test("select many", function (assert: Assert) {
    var base = [[1], [1, 2, 3], [4, 5]];
    var expected = [1,3, 2, 1, 5, 4];
    var actual = new MyArray(...base).selectMany(a => a.reverse());
    assert.deepEqual(actual, expected)
});

QUnit.test("where", function (assert: Assert) {
    var base = [1, 2, 3, 4];

    var expectedEven = [2, 4];
    var actualEven = new MyArray(...base).where(n => n % 2 === 0);
    assert.deepEqual(actualEven, expectedEven);

    var expectedEmpty : any[] = [];
    var actualEmpty = new MyArray(...base).where(n => n > 15);
    assert.deepEqual(actualEmpty, expectedEmpty, "empty result")
});

QUnit.test("count", function (assert: Assert) {
    var base = [1, 2, 3, 4];

    var actual = new MyArray(...base).count();
    assert.deepEqual(actual, 4);

    var actualEven = new MyArray(...base).count(n => n % 2 === 0);
    assert.deepEqual(actualEven, 2);

    var actualEmpty = new MyArray(...base).count(n => n > 15);
    assert.deepEqual(actualEmpty, 0)
});

QUnit.test("any", function (assert: Assert) {
    var base = [1, 2, 3, 4];

    var actual = new MyArray().any();
    assert.deepEqual(actual, false);
    
    var actualEven = new MyArray(...base).any(n => n % 2 === 0);
    assert.deepEqual(actualEven, true);
    
    var actualEmpty = new MyArray(...base).any(n => n > 15);
    assert.deepEqual(actualEmpty, false)
});

QUnit.test("all", function (assert: Assert) {
    var base = [1, 2, 3, 4];

    var actual = new MyArray(...base).all(n => n > 0);
    assert.deepEqual(actual, true);

    var actualEven = new MyArray(...base).all(n => n % 2 === 0);
    assert.deepEqual(actualEven, false);

    var actualEmpty = new MyArray(...base).any(n => n > 15);
    assert.deepEqual(actualEmpty, false)
});

QUnit.test("firstOrDefault", function (assert: Assert) {
    var base = [1, 2, 3, 4];

    var actual = new MyArray(...base).firstOrDefault()
    assert.deepEqual(actual, 1);

    var actualFilter = new MyArray(...base).firstOrDefault(n => n > 1);
    assert.deepEqual(actualFilter, 2);

    var actualEmpty = new MyArray().firstOrDefault();
    assert.deepEqual(actualEmpty, null);

    var actualEmptyFilter = new MyArray(...base).firstOrDefault(n => n < 0);
    assert.deepEqual(actualEmptyFilter, null);
});

QUnit.test("first", function (assert: Assert) {
    var base = [1, 2, 3, 4];

    var actual = new MyArray(...base).first()
    assert.deepEqual(actual, 1);

    var actualFilter = new MyArray(...base).first(n => n > 1);
    assert.deepEqual(actualFilter, 2);

    try {
        var actualEmpty = new MyArray().first();
        assert.notOk(true);
    } catch (e) {
        assert.ok(true);
    }

    try {
        var actualEmptyFilter = new MyArray(...base).first(n => n < 0);
        assert.notOk(true);
    } catch (e) {
        assert.ok(true);
    }

    var nullArray = [null, null, null]
    var actualNull = new MyArray(...nullArray).first();
    assert.deepEqual(actualNull, null); 
});

QUnit.test("lastOrDefault", function (assert: Assert) {
    var base = [1, 2, 3, 4];

    var actual = new MyArray(...base).lastOrDefault()
    assert.deepEqual(actual, 4);

    var actualFilter = new MyArray(...base).lastOrDefault(n => n > 1);
    assert.deepEqual(actualFilter, 4);

    var actualEmpty = new MyArray().lastOrDefault();
    assert.deepEqual(actualEmpty, null);

    var actualEmptyFilter = new MyArray(...base).lastOrDefault(n => n < 0);
    assert.deepEqual(actualEmptyFilter, null);
});

QUnit.test("last", function (assert: Assert) {
    var base = [1, 2, 3, 4];

    var actual = new MyArray(...base).last()
    assert.deepEqual(actual, 4);

    var actualFilter = new MyArray(...base).last(n => n > 1);
    assert.deepEqual(actualFilter, 4);

    try {
        var actualEmpty = new MyArray().last();
        assert.notOk(true);
    } catch (e) {
        assert.ok(true);
    }

    try {
        var actualEmptyFilter = new MyArray(...base).last(n => n < 0);
        assert.notOk(true);
    } catch (e) {
        assert.ok(true);
    }

    var nullArray = [null, null, null]
    var actualNull = new MyArray(...nullArray).last();
    assert.deepEqual(actualNull, null);
});

QUnit.test("shuffle", function (assert: Assert) {
    var base = [1, 2, 3, 4];

    var myArray = new MyArray(...base);
    var shuffled = myArray.shuffle();

    assert.deepEqual(myArray, base);
});

QUnit.test("distinct", function (assert: Assert) {
    var base = [1, 2, 2, 1, 3, 4, 2, 1]

    var expected = [1, 2, 3, 4];
    var actual = new MyArray(...base).distinct();
    assert.deepEqual(actual, expected);

    var expectedCondition = [1, 2];
    var actualCondition = new MyArray(...base).distinct((m, n) => m % 2 == n % 2);
    assert.deepEqual(actualCondition, expectedCondition);
});

QUnit.test("except", function (assert: Assert) {
    var base = [1, 2, 3, 4, 5, 6, 7];

    var expected = [1, 4, 7];
    var actual = new MyArray(...base).except(2, 3, 6, 5, 8, 2);
    assert.deepEqual(actual, expected);

    var expectedEmpty : any[] = [];
    var actualEmpty = new MyArray(...base).except(...base);
    assert.deepEqual(actualEmpty, expectedEmpty);
});

QUnit.test("drop", function (assert: Assert) {
    var base = [1, 2, 3];

    var expected = [2,3];
    var actual = new MyArray(...base).drop(1);
    assert.deepEqual(actual, expected);
});

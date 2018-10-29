class MyArray<T> extends Array<T>{
    static lastOrDefault<T>(array: T[]): T | null {
        if (array.length > 0) {
            return array[array.length - 1];
        } else {
            return null;
        }
    }

    static last<T>(array: T[]): T {
        if (array.length > 0) {
            return array[array.length - 1];
        } else {
            throw new Error('Invalid operation.');
        }
    }

    static shuffle<T>(array: T[]): T[] {
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
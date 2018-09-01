class MyArray<T> extends Array<T>{
	constructor(...array: T[]) {
			if (array.length == 1) {
					// array constructor does something different when given a single number
					// avoid that
					super();
					this.push(array[0])
			} else {
					super(...array);
			}
	}

	select<S>(func: (t: T) => S): MyArray<S> {
			var result: S[] = this.map(func);
			return new MyArray<S>(...result);
	}

	selectMany<S>(func: (t: T) => Array<S>): MyArray<S> {
			var results = this.select(func);
			var concat = new MyArray<S>();
			results.forEach(arr => {
					concat.push(...arr);
			})
			return concat;
	}

	where(func: (t: T) => boolean): MyArray<T> {
			// filter has weird behaviour, possibly because we're extending array
			// if you filter out all members, it returns an array containing a 0
			// so we'll just reimplement it
			var result: T[] = [];
			this.forEach(t => {
					if (func(t)) {
							result.push(t);
					}
			});
			return new MyArray(...result);
	}

	count(func?: (t: T) => boolean): number {
			if (func !== undefined) {
					return this.where(func).count();
			} else {
					return this.length;
			}
	}

	any(func?: (t: T) => boolean): boolean {
			if (func !== undefined) {
					return this.some(func)
			} else {
					return this.length > 0;
			}
	}

	all(func: (t: T) => boolean): boolean {
			return this.every(func);
	}

	singleOrDefault(func?: (t: T) => boolean): T | null {
			if (func !== undefined) {
					return this.where(func).single();
			} else {
					if (this.length == 1) {
							return this[0];
					} else {
							return null;
					}
			}
	}

	single(func?: (t: T) => boolean): T {
			var result = this.singleOrDefault(func);
			if (result == null) {
					throw new Error('Invalid operation.');
			} else {
					return result;
			}
	}

	firstOrDefault(func?: (t: T) => boolean): T | null {
			if (func !== undefined) {
					let length = this.length;
					for (let ii = 0; ii < length; ii++) {
							if (func(this[ii])) {
									return this[ii];
							}
					}
					return null;
			} else {
					if (this.length > 0) {
							return this[0];
					} else {
							return null;
					}
			}
	}

	first(func?: (t: T) => boolean): T {
			if (func !== undefined) {
					let length = this.length;
					for (let ii = 0; ii < length; ii++) {
							if (func(this[ii])) {
									return this[ii];
							}
					}
					throw new Error('Invalid operation.');
			} else {
					if (this.length > 0) {
							return this[0];
					} else {
							throw new Error('Invalid operation.');
					}
			}
	}

	lastOrDefault(func?: (t: T) => boolean): T | null {
			if (func !== undefined) {
					return this.where(func).lastOrDefault();
			} else {
					if (this.length > 0) {
							return this[this.length - 1];
					} else {
							return null;
					}
			}
	}

	last(func?: (t: T) => boolean): T {
			if (func !== undefined) {
					return this.where(func).last();
			} else {
					if (this.length > 0) {
							return this[this.length - 1];
					} else {
							throw new Error('Invalid operation.');
					}
			}
	}

	shuffle(): MyArray<T> {
			var results = new MyArray(...this);
			for (let ii = results.length; ii > 0; ii--) {
					var rand = Math.trunc(Math.random() * ii);
					var temp = results[rand];
					results[rand] = results[ii - 1];
					results[ii - 1] = temp;
			}
			return results;
	}

	distinct(func?: (t1: T, t2: T) => boolean): MyArray<T> {
			var results: T[] = [];
			this.forEach(t => {
					if (func !== undefined) {
							if (results.findIndex(t2 => func(t, t2)) < 0) {
									results.push(t);
							}
					} else {
							if (results.indexOf(t) < 0) {
									results.push(t);
							}
					}
			});
			return new MyArray(...results);
	}

	except(...exceptions: T[]): MyArray<T> {
			return this.where(t => exceptions.indexOf(t) < 0);
	}

	drop(n: number) {
			var results = this.slice(n);
			return new MyArray(...results);
	}

	contains(t: T):boolean {
			return this.any(t2 => t2 == t);
	}
}

function selectAsMyArray<S, T>(array: S[], func: (s: S) => T): MyArray<T> {
	var result: T[] = array.map(func);
	return new MyArray(...result);
}
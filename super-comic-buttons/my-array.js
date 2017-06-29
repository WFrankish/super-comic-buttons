"use strict";

// this is basically linq
class MyArray extends Array{
	constructor(...args){
		if(args.length == 1 && typeof args[0] === "number"){
			super();
			this.push(args[0]);
		}
		else{
			super(...args);
		}
	}
	any(func){
		return this.count(func) > 0;
	}
	count(func){
		var filtered = this.where(func);
		return filtered.length;
	}
	first(func){
		var filtered = this.where(func);
		return filtered[0];
	}
	last(func){
		var filtered = this.where(func);
		return filtered[filtered.length -1];
	}
	// select and where are already implemented as map and filter, but when I realised
	// and replaced them it acted weird so whatever
	select(func){
		if(typeof func !== "function"){
			return this;
		}
		var res = new MyArray();
		this.forEach(val => res.push(func(val)));
		return res;
	}
	where(func){
		if(typeof func !== "function"){
			return this;
		}
		var res = new MyArray();
		this.forEach(val => {
			if(func(val)){
				res.push(val);
			}
		});
		return res;
	}
}
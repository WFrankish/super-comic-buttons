"use strict";

// takes an input, and replaces it with a default if null or undefined
function or(obj, def = {}){
    if(typeof obj === "undefined" || obj === null){
        return def;
    } else {
        return obj;
    }
}

// returns if two objects are equal, or if both are equivalent dates
function dateEquals(a, b){
	if(a === b){
		return true;
	}
	if(a instanceof Date && b instanceof Date){
		return a.valueOf() === b.valueOf();
	}
	return false;
}

function pluralise(num, string, plural = string+"s"){
	if(num === 1){
		return num + " " + string;
	} else {
		return num + " " + plural;
	}
}

// returns a number in milliseconds as a time, to specified precision
function asTimeString(num, level){
	const sec = 1000;
	const min = 60*sec;
	const hour = 60*min;
	const day = 24*hour;
	const week = 7*day;
	const year = 365*day;
	var res = [];
	if(num >= year){
		var years = Math.trunc(num / year);
		res.push(pluralise(years, "year"));
		num = num % year;
	}
	if(num >= week && level > 0){
		var weeks = Math.trunc(num / week);
		res.push(pluralise(weeks, "week"));
		num = num % week;
	}
	if(num >= day && level > 1){
		var days = Math.trunc(num / day);
		res.push(pluralise(days, "day"));
		num = num % day;
	}
	if(num >= hour && level > 2){
		var hours = Math.trunc(num / hour);
		res.push(pluralise(hours, "hour"));
		num = num % hour;
	}
	if(num >= min && level > 3){
		var mins = Math.trunc(num / min);
		res.push(pluralise(mins, "minute"));
		num = num % min;
	}
	if(num >= sec && level > 4){
		var secs = Math.trunc(num / sec);
		res.push(pluralise(secs, "second"));
		num = num % sec;
	}
	if(level > 6){
		res.push(pluralise(num, "millisecond"));
	}
	if(res.length > 0){
		return res.join(", ");
	} else {
		if(level == 0){
			return "no years";
		}
		if(level == 1){
			return "no weeks";
		}
		if(level == 2){
			return "no days";
		}
		if(level == 3){
			return "no minutes";
		}
		if(level == 4){
			return "no seconds";
		}
		return "no time";
	}

}
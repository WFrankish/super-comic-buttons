// takes an input, and replaces it with a default if null or undefined
function or<T, T2>(obj : T | undefined | null, def : T2 | {} = {}) : T | T2 | {} {
    if(typeof obj === "undefined" || obj === null){
        return def;
    } else {
        return obj;
    }
}

// returns if two objects are equal, or if both are equivalent dates
function dateEquals(a : any, b : any) : boolean {
	if(a === b){
		return true;
	}
	if(a instanceof Date && b instanceof Date){
		return a.valueOf() === b.valueOf() || (isNaN(a.valueOf()) && isNaN(b.valueOf()));
	}
	return false;
}

function pluralise(num : number, string : string, plural = string+"s") : string {
	if(num === 1){
		return num + " " + string;
	} else {
		return num + " " + plural;
	}
}

// returns a number in milliseconds as a time, to specified precision
function asTimeString(num : number, level : number) : string {
	const sec = 1000;
	const min = 60*sec;
	const hour = 60*min;
	const day = 24*hour;
	const week = 7*day;
	const year = 365*day;
	var res : string[] = [];
	if(num >= year){
		var years = Math.trunc(num / year);
    if(years > 0){
      res.push(pluralise(years, "year"));
      num = num % year;
      level--;
    }
	}
	if(num >= week && level > 0){
		var weeks = Math.trunc(num / week);
    if(weeks > 0){
      res.push(pluralise(weeks, "week"));
      num = num % week;
      level--
    }
	}
	if(num >= day && level > 0){
		var days = Math.trunc(num / day);
    if(days > 0){
      res.push(pluralise(days, "day"));
      num = num % day;
      level--;
    }
	}
	if(num >= hour && level > 0){
		var hours = Math.trunc(num / hour);
    if(hours > 0){
      res.push(pluralise(hours, "hour"));
      num = num % hour;
      level--;
    }
	}
	if(num >= min && level > 0){
		var mins = Math.trunc(num / min);
    if(mins > 0){
      res.push(pluralise(mins, "minute"));
      num = num % min;
      level--;
    }
	}
	if(num >= sec && level > 0){
		var secs = Math.trunc(num / sec);
    if(secs > 0){
      res.push(pluralise(secs, "second"));
      num = num % sec;
      level--;
    }
	}
	if(level > 0){
    if(num > 0){
      res.push(pluralise(Math.round(num), "millisecond"));
    }
	}
	if(res.length > 0){
		return res.join(", ");
	} else {
		return "no time";
	}

}

function hashString(str : string) : number {
  var hash = 0;
  for(var i = 0; i < str.length; i++){
    var chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

function randomHue(seed : number) : number {
  return (Math.sin(seed * (0.5 / Math.PI)) + 1) / 2;
}
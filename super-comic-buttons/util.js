"use strict";

// takes an input, and replaces it with a default if null or undefined
function or(obj, def = {}){
    if(typeof obj === "undefined" || obj === null){
        return def;
    } else {
        return obj;
    }
}
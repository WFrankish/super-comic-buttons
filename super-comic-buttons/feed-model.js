"use strict";

class Feed{
    constructor(){
        this.recent = [];
		this.count = 0;
    }
	get latest(){
		return 
	}
    averageTime(){
        var total = 0;
        for(var i = 0; i < this.list.length; i++){
            total += this.list[i].date.getHours() * 60;
            total += this.list[i].date.getMinutes();
        }
        var hours = Math.trunc(total / 60);
        var minutes = total % 60;
        return `${hours > 9 ? hours : "0" + hours}:${minutes > 9 ? minutes : "0" + minutes}`;
    }
}

class FeedItem{
    constructor(title, date, link){
        this.title = title;
		var now = new Date();
		if(date && date < now){
			this.date = date;
		} else {
			this.date = now;
		}
        this.link = link;
    }
}
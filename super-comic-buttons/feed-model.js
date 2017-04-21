"use strict";

class Feed{
	// ctors
    constructor(){
        this.recent = new MyArray();
		this._count = 0;
		this._unreadLink = "";
		this._unread = 0;
		this._averageGap = 0;
		this._dayMap = [0, 0, 0, 0, 0, 0, 0];
		this._hourMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		this._firstRecord = new Date();
    }
	// getters
	// how many updates this has seen
	get count(){
		return this._count;
	}
	// how many updates are unread
	get unread(){
		return this._unread;
	}
	// the link to the oldest unread item
	get unreadLink(){
		return this._unreadLink;
	}
	// get average time between updates
	get averageGap(){
		return this._averageGap;
	}

	get averagePerDay(){
		const day = 1000 * 60 * 60 * 24;
		var span = new Date() - this._firstRecord;
		var daysSpan = Math.trunc(span / day);
		return this._count / daysSpan;
	}

	get averagePerWeek(){
		const week = 1000 * 60 * 60 * 24 * 7;
		var span = new Date() - this._firstRecord;
		var weeksSpan = Math.trunc(span / week);
		return this._count / weeksSpan;
	}

	// adding and processing a new list of feed items
	consume(feedItems){
		// find first unread
		var i = this._findReadIndex(feedItems);
		// take unread items
		var unreadItems = new MyArray(...feedItems.slice(0, i));
		if(unreadItems.any()){
			this._unreadLink = unreadItems.last().link;
			this._unread += unreadItems.length;
		}
		for(var i = unreadItems.length-1; i >= 0; i--){
			this._consumeSingle(feedItems[i]);
		}
	}
	_findReadIndex(feedItems){
		for(var i = 0; i < feedItems.length; i++){
			if(this.recent.any(f => f.equals(feedItems[i]))){
				return i;
			}
		}
		return feedItems.length;
	}
	_consumeSingle(feedItem){
		if(this._count > 0){
			// update average time between
			var gap = feedItem.date - this.recent.last().date;
			this._averageGap *= this._count;
			this._averageGap += gap;
			this._averageGap /= (this._count + 1);
		} else {
			this._firstRecord = feedItem.date;
		}
		// update hour map
		this._hourMap = this._hourMap.map(v => v * this._count);
		this._hourMap[feedItem.date.getHours()] += 1;
		this._hourMap = this._hourMap.map(v => v / (this._count+1));
		// update day map
		this._dayMap = this._dayMap.map(v => v * this._count);
		this._dayMap[feedItem.date.getDay()] += 1;
		this._dayMap = this._dayMap.map(v => v / (this._count+1));
		this._count++;
		this.recent.push(feedItem);
		if(this.recent.length > 10){
			this.recent.shift();
		}
	}

	// return the unread link and set the link to the newest item
	updateUnread(){
		if(this.recent.any()){
			var old = this._unreadLink;
			this._unreadLink = this.recent.last().link;
			this._unread = 0;
			return old;
		}
	}

}

class FeedItem{
	// ctors
    constructor(/* string or FeedItem if only param */ titleObj, /* date */ date, /* string */ link){
		if(arguments.length == 1){
			this.title = titleObj.title;
			this.feedDate = titleObj.feedDate;
			this.date = titleObj.date;
			this.link = titleObj.link;
		} else {
			this.title = titleObj;
			this.feedDate = date;
			var now = new Date();
			if(date instanceof Date && date < now){
				this.date = date;
			} else {
				this.date = now;
			}
			this.link = link;
		}
    }
	equals(that){
		if (typeof that != "object"){
			return false;
		}
		var titleMatch = this.title === that.title;
		var linkMatch = this.link === that.link;
		var dateMatch = dateEquals(this.feedDate, that.feedDate);
		return titleMatch && linkMatch && dateMatch;
	}
	toSource(){
		return `(new FeedItem(${super.toSource()}))`;
	}
}
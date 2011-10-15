function Row() {
    this.items = {};
    this.currentIndex = null;
    this.firstIndex = null;
    this.lastIndex = null;
}

Row.prototype.set = function(index, value) {
    if (this.firstIndex === null || this.firstIndex > index) {
        this.firstIndex = index;
    }
    if (this.lastIndex === null || this.lastIndex < index) {
        this.lastIndex = index;
    }
    return this.items[index] = value;
};

Row.prototype.get = function(index) {
    return this.items[index];
};

Row.prototype.on = function(number) {
    return this.items[this.firstIndex + number];
};

Row.prototype.next = function() {
    if (this.currentIndex === null) {
        this.currentIndex = this.firstIndex;
    }
    return this.get(this.currentIndex++);
};

Row.prototype.count = function(value) {
    var count = 0;
    for (var i in this.items) {
        if (this.items.hasOwnProperty(i)) {
            count++;
        }
    }
    return count;
};

Row.prototype.rewind = function() {
    this.currentIndex = this.firstIndex;
    return this;
};

Row.prototype.first = function() {
    return this.get(this.firstIndex);
};

Row.prototype.last = function() {
    return this.get(this.lastIndex);
};

Row.prototype.push = function(value) {
    return this.set(++this.lastIndex, value);
};

Row.prototype.pop = function() {
    var deleted = this.last();
    delete this.items[this.lastIndex--];
    
    if (!this.count()) {
        this.currentIndex = null;
        this.firstIndex = null;
        this.lastIndex = null;
    }
    
    return deleted;
};

Row.prototype.shift = function() {
    var deleted = this.first();
    delete this.items[this.firstIndex++];
    
    if (!this.count()) {
        this.currentIndex = null;
        this.firstIndex = null;
        this.lastIndex = null;
    }
    
    return deleted;
};

Row.prototype.unshift = function(value) {
    return this.set(--this.firstIndex, value);
};

Row.prototype.hasNext = function() {
    if (this.lastIndex === null ||
        this.firstIndex === null) {
        return false;
    }
    return this.lastIndex >= this.currentIndex;
};

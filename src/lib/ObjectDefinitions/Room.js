/* global Room:true */
/*
RoomObject
roomCode - {string} Room that the card is in
categories - {string[]} Categories for the room
createdAt - {datetime} Will default to now, but can pass a time for testing
moderator - {string} Connction id of user who has moderator power in the room
reveal - {boolean} If the cards should be visible to everyone besides author
anonymousAccess - {object} Access that people who are not signed in have
*/

/*
AnonymousAccess Object
read - {boolean}
write - {boolean}
*/
Room = function(){
    this.roomCode = "";
    this.categories = [{category:"Went Well", color:"#00ff00"},
                       {category:"Went Poorly", color:"#ff0000"}];
    this.createdAt = new Date();
    this.moderator = "";
    this.reveal = false;
};

Room.prototype.withRoomCode = function (roomCode) {
    this.roomCode = roomCode;
    return this;
};

Room.prototype.withCategories = function (categories) {
    this.categories = categories;
    return this;
};

Room.prototype.createdAtTime = function (createdAt) {
    this.createAt = createdAt;
    return this;
};

Room.prototype.moderatedBy = function (moderator) {
    this.moderator = moderator;
    return this;
};

Room.prototype.withRevealStatusSetTo = function (reveal) {
    this.reveal = reveal;
    return this;
};

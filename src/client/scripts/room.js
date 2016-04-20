"use strict";
/* global Cards:false Rooms:false*/
/**
*@purpose To provide the room template with data to display
**/

Template.room.onCreated(function () {
    Meteor.autorun(function() {
        Meteor.subscribe("cards", Session.get("roomNumber"));
    });
});

Template.room.helpers({

    getCategories: function() {
        return Rooms.findOne(
            {"roomCode": Session.get("roomNumber")}
        ).categories;
    },
    //TODO have this call another mentod
    cards : function(category) {
        var roomData = Rooms.findOne({"roomCode": Session.get("roomNumber")});
        var cards = [];
        var author;

        if(Meteor.user()){
            author = Meteor.user().profile.name;
        } else {
            author = Session.get("author");
        }
        if(roomData.reveal){
            cards = Cards.find({
                "roomCode": Session.get("roomNumber"),
                "category": category
            });
        } else {
            cards = Cards.find({
                "roomCode": Session.get("roomNumber"),
                "category": category,
                $or: [{"reveal": true}, {"author": author}]
            },{sort: {createdAt: -1}});
        }

        return cards;
    },

    isModerator: function(){
        var room = Rooms.findOne({"roomCode": Session.get("roomNumber")});

        return room.owner._id == Meteor.userId();
    }
});

Template.room.events({
    "click #revealCardButton": function(){
        Meteor.call("revealCards", Session.get("roomNumber"));
    },

    "click #deleteCardButton": function(){
        if($(window).width() <= 768)
            $(".modal").modal("hide");
        Meteor.call("deleteCard", this._id);
    },

    "click tag": function(e){
        e.stopPropagation();
        filterSingleTag(e.toElement.innerHTML);
    },

    "submit #tagSearchForm": function(e){
        e.preventDefault();
        var tags = e.target.filters.value.split(",");

        tags = tags.map(function(element){
            return element.toLowerCase().trim();
        });
        filterMultipleTags(tags);
    },

    "click #removeTag": function(e){
        e.stopPropagation();
        var tags;
        var prevEleTag;
        var text;

        prevEleTag = e.target.previousElementSibling.innerHTML;
        prevEleTag = prevEleTag.toLowerCase();
        tags = $(e.toElement.parentNode.parentNode).find(".tag");
        text = $(e.toElement.parentNode.parentNode.previousElementSibling);
        text = text[0].innerText;
        var newTags;
        var oldTags;

        newTags = [];
        oldTags = [];
        var count;

        count = 0;
        for(var j = 0; j < tags.length; j++){
            oldTags[j] = tags[j].innerHTML;
        }
        for(var i = 0; i < oldTags.length; i++){
            if(oldTags[i].toLowerCase() != prevEleTag){
                newTags[count] = oldTags[i].toLowerCase();
                count++;
            }
        }
        Meteor.call("removeTag",text,oldTags,
          newTags,Session.get("roomNumber"));
    },

    "click #clearFilter": function(){
        clearFilter();
        $("#filters").val("");
    },

    "click #exportButton": function() {
        var roomCode = Session.get("roomNumber");

        Router.go("/room/" + roomCode + "/export");
    },

    // TODO this should probably be a card event not a room event
    "click #likeButton": function(eve){
        eve.stopPropagation();
        //TODO FIX THIS SHIT!
        if(eve.target.id === "likeButton") {
            eve.target.disabled = true;
        } else if(eve.target.parentNode.id === "likeButton") {
            eve.target.parentNode.disabled = true;
        }

        Cards.update({ _id: this._id}, { $inc: {likes: 1} });
    }
});

/**
*@param {string} tag - tag to filter cards by
*Filters cards by the tag given
**/
function filterSingleTag(tag){
    tag = tag.toLowerCase();
    $("#filters").val(tag);
    var numCards;

    numCards = $(".card-panel").length;
    for(var i = 0; i < numCards;i++){
        var compTags;
        var found;

        found = false;
        compTags = $(".card-panel").eq(i).find(".tag");
        for(var j = 0; j < compTags.length; j++){
            if(compTags[j].innerHTML.toLowerCase().indexOf(tag) >= 0)
                found = true;
        }
        if(!found)
            $(".card-panel").eq(i).hide();
        else if (found)
            $(".card-panel").eq(i).show();
    }
}

/**
*@param {string[]} tags - Array of strings containing tags to filter by
*Filters displayed cards by tags
**/
function filterMultipleTags(tags){
    var numCards;

    numCards = $(".card-panel").length;
    for(var i = 0; i < numCards;i++){
        var compTags;
        var found;

        found = false;
        compTags = $(".card-panel").eq(i).find(".tag");
        for(var j = 0; j < compTags.length; j++){
            if(tags.indexOf(compTags[j].innerHTML) >= 0)
                found = true;
        }
        if(!found)
            $(".card-panel").eq(i).hide();
        else if (found)
            $(".card-panel").eq(i).show();
    }
}

/**
*Clears filters field and show all cards
**/
function clearFilter(){
    $("#filters").val("");
    var numCards;

    numCards = $(".card-panel").length;
    for(var i = 0; i < numCards;i++){
        $(".card-panel").eq(i).show();
    }
}

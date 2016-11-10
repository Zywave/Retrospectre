"use strict";
/* global Cards:false SnackbarMethods:false UserMethods:false DEFAULT_SNACKBAR_TIMEOUT:false Rooms:false Popup:false UserMethods:false RoomMethods:true*/

const MinCommentLen = 4;
var EditedCard = function(thought,tags,category){
    this.thought = thought;
    this.tags = tags;
    this.category = category;
};

Template.cardModal.helpers({
    cardModalInfo: function(_id) {
        return Cards.findOne({"_id": _id});
    },
    cardHasTags: function(cardId){
        var tags = Cards.findOne({_id:cardId}).tags;

        return tags.length > 0; //eslint-disable-line
    },
    cardTags: function(_id){
        var card = Cards.findOne({"_id": _id});
        var cardTags = card.tags;

        return cardTags.toString();
    },
    showEditButton: function(_id){
        return (isOwner(_id) && Session.get("editCardMode") !== true)
        ? "visible;"
        : "hidden;";
    },
    inEditMode: function(){
        return Session.get("editCardMode") === true;
    },
    categories: function() {
        return Rooms.findOne(
            {"roomCode": Session.get("roomCode")}
        ).categories;
    },
    canDelete: function(cardId){
        var currCardAuth = Cards.findOne({_id:cardId}).author;
        var user = Meteor.user() ? Meteor.user().profile.name : Session.get("author");

        return (currCardAuth === user || RoomMethods.IsModerator(Session.get("roomCode")))
            && Session.get("editCardMode") === false;
    },
    cardHasComments: function(cardId){
        var comments = Cards.findOne({_id:cardId}).comments;

        return comments.length > 0; //eslint-disable-line
    }

});

Template.cardModal.events({
    "submit #commentFormField": function(eve){
        eve.preventDefault();
        var commentToAdd = validComment(eve);
        if(commentToAdd){
            Meteor.call("submitComment",this._id,commentToAdd);
            eve.target.comment.value = "";
            $("ul.collapsible li").show();
            $("i.fa-caret-right").addClass("fa-caret-down");
            $("i.fa-caret-right").removeClass("fa-caret-right");
        }
    },

    "click #deleteCardButton": function(){
        var maxWidth = 768;
        var _id = this._id;
        Popup.Confirm("Delete this card", function(){
            if($(window).width() <= maxWidth)
                $(".modal").modal("hide");
            Meteor.call("deleteCard", _id, Session.get("roomCode"), Session.get("author"));
        });
    },

    "click #removeTag": function(e){
        var cardID = e.target.offsetParent.offsetParent.offsetParent.offsetParent.id;
        var tagToRemove  = e.target.previousElementSibling.innerHTML;
        Meteor.call("removeTag",cardID,tagToRemove);
    },

    "click span i.fa-caret-right": function(eve){
        eve.toElement.className = "fa fa-caret-down";
        $("ul.collapsible li").show();
    },

    "click span i.fa-caret-down": function(eve){
        eve.toElement.className = "fa fa-caret-right";
        $("ul.collapsible li").hide();
    },
    "click #editCardButton": function(eve){
        eve.preventDefault();
        Session.set("editCardMode", true);
    },
    "submit .addTags": function(e){
        e.preventDefault();
        var newTags = e.target.tags.value;
        var tags = newTags.split(",");
        var tagSet = new Set();

        tags.forEach(v => tagSet.add(s(v).clean().titleize().value()));
        var thisRoom = Rooms.findOne({_id:Session.get("roomCode")});
        var thisTags = thisRoom.tags;

        thisTags.forEach(v => tagSet.add(v));
        var tagArray = Array.from(tagSet);

        Meteor.call("addTags", tagArray);
    },
    "submit #edit-form": function (e) {
        e.preventDefault();
        var id = this._id;
        var changes = grabEdits(e);
        $("#" + id).modal("hide");
        Session.set("editCardMode", false);
        Meteor.call("updateCard", id, changes.thought, changes.category, changes.tags);
    }
});
Template.registerHelper("equals", function (a, b) {
    return a === b;
});

function isOwner(_id){
    var card = Cards.findOne({"_id": _id});

    if(UserMethods.getAuthor() === card.author)
        return true;
    return false;
}

function validComment(eve){
    var comment = eve.target.comment.value;
    var commentToAdd = null;

    if(!comment || comment.length <= MinCommentLen)
        SnackbarMethods.DisplayMessage("Enter a more valuable comment",
          DEFAULT_SNACKBAR_TIMEOUT);
    else{
        var author = UserMethods.getAuthor();
        var image = Meteor.userId() ? UserMethods.getUserImage(Meteor.userId()) : null;
        commentToAdd = new Comment().createdBy(author)
          .withText(comment).createdAtTime(new Date()).withAvatar(image);
    }
    return commentToAdd;
}

function grabEdits(e){
    var thought = e.target.thought.value;
    var category = e.target.categoryDropdown.value;
    var newTags = e.target.tags.value;
    var tags = newTags.split(",");
    var tagSet = new Set();
    tags.forEach(v => tagSet.add(s(v).clean().titleize().value()));
    tagSet.delete(""); // Delete Empty tags from submission
    var tagArray = Array.from(tagSet);
    Session.set("editCardMode", false);
    return new EditedCard(thought,tagArray,category);
}

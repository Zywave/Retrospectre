"use strict";
/* global Cards:false SnackbarMethods:false UserMethods:false */

Template.cardModal.helpers({
    cardModalInfo: function(_id) {
        return Cards.findOne({"_id": _id});
    },
    cardTags: function(_id){
        var card = Cards.findOne({"_id": _id});
        var cardTags = card.tags;

        return cardTags.toString();
    }
});

Template.cardModal.events({
    "click #submitCommentButton": function(eve){
        eve.preventDefault();
        var comment = eve.target.parentNode.previousElementSibling.value;
        var image = null;

        if(!comment || comment.length <= 4)
            SnackbarMethods.DisplayMessage("Enter a more valuable comment",
              3000);
        else{
            var author;

            if(!Meteor.user())
                author = Session.get("author");
            else{
                author = Meteor.user().profile.name;
                image = UserMethods.getUserImage(Meteor.user()._id);
            }
            var commentToAdd = new Comment().createdBy(author)
              .withText(comment).createdAtTime(new Date()).withAvatar(image);

            Meteor.call("submitComment",this._id,commentToAdd);
            eve.target.parentNode.previousElementSibling.value;
            $("ul.collapsible li").show();
            $("i.fa-caret-right").addClass("fa-caret-down");
            $("i.fa-caret-right").removeClass("fa-caret-right");
        }
    },
    "click span i.fa-caret-right": function(eve){
        eve.toElement.className = "fa fa-caret-down";
        $("ul.collapsible li").show();
    },

    "click span i.fa-caret-down": function(eve){
        eve.toElement.className = "fa fa-caret-right";
        $("ul.collapsible li").hide();
    },

    "click .close, click #cardModalClose":function(){
        if($(window).width() <= 768){
            $("#" + this._id).modal("hide");
        }
    }
});

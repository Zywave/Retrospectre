"use strict";
/**
*@author TreJon House
*@date 1/18/16
*@verion 1.0
*@edited 1/24/16
*@purpose Once the room page is rendered, need to connect to
*the cards in current room and display them
**/

/**
*Adding meteor methods give methods we can
*call using meteor.call this mandatory
*when trying to handle the DB in any manner
*it revokes DB access to the client
*this is due to removing the insecure package
**/

Meteor.methods({
    submitCard: function (roomNumber, category, text) {
        Mongo.Collection.get("cards").insert({
            roomCode: roomNumber,
            category: category,
            createdAt: new Date(),
            text: text,
            tags: null
        });
    },
    submitCardWithTags: function (roomNumber, category, text, tags){
        Mongo.Collection.get("cards").insert({
            roomCode: roomNumber,
            category: category,
            createdAt: new Date(),
            text: text,
            tags: tags
        });
    }
});

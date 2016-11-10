/* global RoomMethods SnackbarMethods Logs DEFAULT_SNACKBAR_TIMEOUT:true UserMethods:false*/
"use strict";

Router.configure({
    layoutTemplate: "headerFooter"
});

Router.route("/", {
    name: "Home",
    template: "landingPage",
    title: "Home"
});

Router.route("/room/:_roomNumber/export", {
    name: "Export",
    path: "/room/:_roomNumber/export",
    template: "exportRoom",
    title: "Export",
    waitOn: function() {
        return [Meteor.subscribe("rooms", this.params._roomNumber), Meteor.subscribe("keynotes")];
    },
    onBeforeAction: function() {
        Session.set("roomCode", this.params._roomNumber);
        this.next();
    }
});

Router.route("/room/:_roomNumber", {
    name: "Room",
    path: "/room/:_roomNumber",
    template: "room",
    title: "The Poltergeists",
    waitOn: function() {
        return Meteor.subscribe("rooms", this.params._roomNumber);
    },
    onBeforeAction: function() {
        if (RoomMethods.RoomExists(this.params._roomNumber)) {
            Session.set("roomCode", this.params._roomNumber);
            Meteor.subscribe("removeUserAfterLeaveRoom",Session.get("roomCode"));
            this.next();
        } else {
            SnackbarMethods.DisplayMessage("Room does not exist, redirected to home", DEFAULT_SNACKBAR_TIMEOUT);
            this.redirect("/");
        }
    }
});

Router.route("/create-room", {
    name: "Create Room",
    template: "createRoom",
    title: "Create Room"
});

Router.map(function() {
    this.route("logdump", {
        path: "/logdump",
        where: "server",
        action: function() {
            var query = this.params.query.query;
            var json = {};

            try {
                if (query) {
                    query = JSON.parse(query);
                } else {
                    query = {};
                }
                json = Logs.find(query).fetch();
                this.response.setHeader("Content-Type", "application/json");
            } catch (e) {
                json = {
                    error: "Error parsing query"
                };
            }
            this.response.end(JSON.stringify(json));
        }
    });
});

if (Meteor.isServer) {
    Meteor.publish("removeUserAfterLeaveRoom", function(roomCode) {
        var id = this.userId;
        this._session.socket.on("close",Meteor.bindEnvironment(function() {
            if (id)
                UserMethods.removeUserFromRoom(id, roomCode);
        }));
    });
}

//  If current session is on the client side then return the title of the current route taken
if (Meteor.isClient) {
    Template.headerFooter.helpers({
        title: function() {
            document.title = "Retrospectre - " +
                Router.current().route.options.title;
            return Router.current().route.options.title;
        }
    });
}

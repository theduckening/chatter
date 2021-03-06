 "use strict";

var express = require("express");
var path = require("path");

module.exports = function(server, io){
  server.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "public/views/index.html"));
  });


  server.get("/landing", function(req, res){
    res.sendFile(path.join(__dirname, "public/views/landing.html"));
  });

  //For custom channels
  // server.post("/:channelname", function(req, res){
  //   res.sendFile(path.join(__dirname, "public/views/index.html"));
  // });

  server.get("/*", function(req, res){
    res.redirect("/");
  });


  var participantList = [];

  io.on("connection", function(socket){
    var userId = getRandomParticipantName();
    participantList.push(userId);

    socket.emit("get_id", userId);
    socket.broadcast.emit("notification", {
      type: "JOIN",
      message: userId + " has joined the chat."
    });
    io.emit("participant_list", participantList);


    //FOR TYPING STATUS
    socket.on("status", function(client){
      io.emit("status", client);
    });

    //FOR AFK
    //@param client = {name: String, afk: Bool", time: Date};
    socket.on("afk", function(client){
      console.log(client);
      io.emit("afk", client);
    });

    //FOR CHAT MESSAGE
    socket.on("chatmessage", function(msg){
      socket.broadcast.emit("chatmessage", msg);
    });

    socket.on("disconnect", function(){
      io.emit("notification",  {
        type: "LEAVE",
        message: userId + " has left the chat."
      });
      //try and see if filter and reassignment works here.  I have doubts though.
      participantList.splice(participantList.indexOf(userId), 1);
      io.emit("participant_list", participantList);
    });

  });
};

function getRandomParticipantName(){
  var colours = ["Red", "Orange", "Yellow", "Teal", "Green", "Lavender", "Indigo"];
  var animals = ["Aardvark", "Baboon", "Crocodile", "Dog", "Giraffe", "Rhino"];

  var randColour = colours[Math.floor(Math.random()*100) % colours.length];
  var randAnimal = animals[Math.floor(Math.random()*100) % animals.length];
  var randNumber = Math.floor(Math.random()*100);
  var randNickname = randColour + randAnimal + randNumber.toString();

  return randNickname;
}

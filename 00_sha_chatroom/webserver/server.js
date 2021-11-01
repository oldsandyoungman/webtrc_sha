'use strict'

var http = require('http');
var https = require('https');
var fs = require('fs');

var serveIndex = require('serve-index');
var express = require('express');


var socketIo = require('socket.io')

var log4js = require('log4js');

log4js.configure({
    appenders: {
        file: {
            type: 'file',
            filename: 'app.log',
            layout: {
                type: 'pattern',
                pattern: '%r %p - %m',
            }
        }
    },
    categories: {
        default: {
            appenders: ['file'],
            level: 'debug'
        }
    }
});


var logger = log4js.getLogger();


var app = express();

//顺序不能换
app.use(serveIndex('./public'));
app.use(express.static('./public'));

var options = {
    key  : fs.readFileSync('./cert/1557605_www.learningrtc.cn.key'),
    cert : fs.readFileSync('./cert/1557605_www.learningrtc.cn.pem')
}

var http_server = http.createServer(app);
http_server.listen(8081, '0.0.0.0');

var https_server = https.createServer(options, app);
var io = socketIo(https_server);
io.sockets.on('connection', (socket)=> {

    socket.on('join', (room)=>{
        socket.join(room);
        var myRoom = io.sockets.adapter.rooms[room];
        var users = Object.keys(myRoom.sockets).length;

        logger.log('number:' + users);

        // socket.emit('joined', room, socket.id);
        socket.broadcast.emit('joined', room, socket.id);


    });

    socket.on('leave', (room)=>{

        var myRoom = io.sockets.adapter.rooms[room];
        var users = Object.keys(myRoom.sockets).length;

        logger.log('number:' + (users-1));

        socket.leave(room);

        // socket.emit('joined', room, socket.id);
        socket.broadcast.emit('leaved', room, socket.id);


    })



})
https_server.listen(4430, '0.0.0.0');





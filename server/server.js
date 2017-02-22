const express = require('express');
const socketIO = require('socket.io');

const http = require('http');
const path = require('path');
const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validator')
const {Users} = require('./utils/users')

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server)
var users = new Users();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
	console.log('New user connected');

	// socket.emit from Admin text Welcome to the chat app
	

	// socket.broadcast.emit from Admin text New user joined

	socket.on('join', (params, callback) => {
		if (!isRealString(params.name) || !isRealString(params.room)) {
			return callback('Name and room name are required');
		}

		socket.join(params.room);
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);

		io.to(params.room).emit('updateUserList', users.getUserList(params.room));


		// io.emit: emits to every user
		// socket.broadcast.emit: sends to everyone except current user
		// socket.emit: send to only one user

		socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat room :)'));
		socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));

		callback();
	});

	socket.on('createMessage', (message, callback) => {
		console.log('createMessage', message);
		io.emit('newMessage', generateMessage(message.from, message.text));
		callback();
		
	});

	socket.on('createLocationMessage', (coords) => {
		io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude))
	});

	socket.on('disconnect', () => {
		var user = users.removeUser(socket.id);

		if (user) {
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
		}
		console.log('Disconnected from client');
	});
});


server.listen(port, () => {
	console.log(`Server is up on port ${port}`);
});
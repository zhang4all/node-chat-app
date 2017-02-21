var socket = io();

// this is the connection event
socket.on('connect', function () {
	console.log('Connected to server');
});

// this is the disconnect event
socket.on('disconnect', function () {
	console.log('Disconnected from server');
});

// this listens for data from server and prints it out
socket.on('newMessage', function(message) {
	console.log('newMessage', message);
});
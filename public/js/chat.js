var socket = io();

function scrollToBottom () {
	var messages = jQuery('#messages');
	var newMessage = messages.children('li:last-child')

	var clientHeight = messages.prop('clientHeight');
	var scrollTop = messages.prop('scrollTop');
	var scrollHeight = messages.prop('scrollHeight');
	var newMessageHeight = newMessage.innerHeight();
	var lastMessageHeight = newMessage.prev().innerHeight();

	if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
		messages.scrollTop(scrollHeight);
	}
}

// this is the connection event
socket.on('connect', function () {
	var params = jQuery.deparam(window.location.search);

	
	var room = params.room;
	// add chat room name here
	jQuery("h3").text(`Chat room: ${room}`);
	jQuery("title").text(`Chat room: ${room}`);

	socket.emit('join', params, function (err) {
		if (err) {
			alert(err);
			window.location.href = '/';
		}
		else {
			console.log('No error');
		}
	})
});

// this is the disconnect event
socket.on('disconnect', function () {
	console.log('Disconnected from server');
});

// listens for new users to be added and adds to html
socket.on('updateUserList', function (users) {
	var ol = jQuery('<ol></ol>');

	users.forEach(function (user) {
		ol.append(jQuery('<li></li>').text(user));
	});

	jQuery('#users').html(ol);

	console.log('Users list', users);
});

// this listens for data from server and adds the new message to the html
socket.on('newMessage', function(message) {
	var formattedTime = moment(message.createdAt).format('h:mm a');
	var template = jQuery('#message-template').html();
	var html = Mustache.render(template, {
		text: message.text,
		from: message.from,
		createdAt: formattedTime
	});

	jQuery('#messages').append(html);
	scrollToBottom();
});


// listens for new location messages from the server and adds the location to the html
socket.on('newLocationMessage', function (message) {
	var formattedTime = moment(message.createdAt).format('h:mm a');

	var template = jQuery('#location-message-template').html();
	var html = Mustache.render(template, {
		from: message.from,
		url: message.url,
		createdAt: formattedTime
	});

	jQuery('#messages').append(html);
	scrollToBottom();
});


// listens for the send button to be clicked and then emits the new message that is typed to the server
jQuery('#message-form').on('submit', function (e) {
	e.preventDefault();

	var messageTextbox = jQuery('[name=message]');

	socket.emit('createMessage', {
		text: messageTextbox.val()
	}, function () {
		messageTextbox.val('')
	});
});

// emits the location to the server
var locationButton = jQuery('#send-location');
locationButton.on('click', function () {
	if (!navigator.geolocation) {
		return alert('Geolocation not supported by your browser.')
	}

	locationButton.attr('disabled', 'disabled').text('Sending location...');

	navigator.geolocation.getCurrentPosition(function (position) {
		locationButton.removeAttr('disabled').text('Send location');
		socket.emit('createLocationMessage', {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		})
	}, function () {
		locationButton.removeAttr('disabled').text('Send location');
		alert('Unable to fetch location.');
	});
});

const { io } = require('../server.js');

const {
    USER_CONNECTED,
    USER_DISCONNECTED,
    NEW_MESSAGE,
    CREATE_MESSAGE,
    // NEW_TRADE,
    // CREATE_TRADE,
    // UPDATE_TRADE,
    JOIN_CHANNEL,
    UPDATE_USER_LIST
} = require('../helpers/socketEvents.js');

const { generateMessage } = require('./utils/message.js');
const { Users } = require('./utils/users.js');
const { isValidString } = require('./utils/validation.js');

let users = new Users();

const socketManager = (socket) => {
    console.log('New client connected', socket.id);

    socket.on(JOIN_CHANNEL, (userInfo, callback) => {
        if (!isValidString(userInfo.username) || !isValidString(userInfo.room)) {
            return callback('Valid username and room name are require');
        }

        socket.join(userInfo.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, userInfo.username, userInfo.room);

        io.to(userInfo.room).emit(UPDATE_USER_LIST, users.getUserList(userInfo.room));
        socket.emit(NEW_MESAGE, generateMessage('Server', `You have joined ${userInfo.room} as ${userInfo.username}`));
        socket.broadcast.to(userInfo.room).emit(NEW_MESSAGE, generateMessage('Server', `${userInfo.username} has joined chat`));

        callback();
    });

    socket.on(CREATE_MESSAGE, (message, callback) => {
        const user = users.getUser(socket.id);
        if (user && isValidString(message.text)) {
            io.to(user.channel).emit(NEW_MESSAGE, generateMessage(user.username, message.text));
        }
        callback();
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        const user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit(UPDATE_USER_LIST, users.getUserList(user.room));
            io.to(user.channel).emit(NEW_MESSAGE, generateMessage('Server', `${user.username} has left`));
        }
    });
}

module.exports = socketManager;
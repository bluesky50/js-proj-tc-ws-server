// const path = require('path');
const http = require('http');
// const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const socketIO = require('socket.io');
const routes = require('./routes/index.js');

// const port = process.env.PORT || 5000;

const server = express();
// server.use(cors({
//     origin: '*',
// }));
// server.use(bodyParser.json());

const httpServer = http.createServer(server);
const io = socketIO(httpServer);

const socketManager = require('./socket/socketManager.js');

// io.on('connection', socketManager);

const {
    USER_CONNECTED,
    USER_DISCONNECTED,
    NEW_MESSAGE,
    CREATE_MESSAGE,
    // NEW_TRADE,
    // CREATE_TRADE,
    // UPDATE_TRADE,
    CREATE_TOPIC,
    ADD_TOPIC_VOTE,
    REMOVE_TOPIC_VOTE,
    UPDATE_TOPIC_LIST,
    JOIN_CHANNEL,
    UPDATE_USER_LIST
} = require('./helpers/socketEvents.js');


const { Users } = require('./socket/utils/users.js');
const { Topics } = require('./socket/utils/topicsV2.js');
const { generateMessage } = require('./socket/utils/message.js');
const { isValidString } = require('./socket/utils/validation.js');

let users = new Users();
let topics = new Topics();

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on(JOIN_CHANNEL, (userInfo, callback) => {
        if (!isValidString(userInfo.username) || !isValidString(userInfo.room)) {
            return callback('Valid username and room name are require');
        }

        socket.join(userInfo.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, userInfo.username, userInfo.room);

        io.to(userInfo.room).emit(UPDATE_USER_LIST, users.getUserList(userInfo.room));
        socket.emit(NEW_MESSAGE, generateMessage('Server', `You have joined ${userInfo.room} as ${userInfo.username}`));
        socket.broadcast.to(userInfo.room).emit(NEW_MESSAGE, generateMessage('Server', `${userInfo.username} has joined chat`));
        io.to(userInfo.room).emit(UPDATE_TOPIC_LIST, topics.getUnsortedTopicsList(userInfo.room));

        callback();
    });

    socket.on(CREATE_MESSAGE, (message, callback) => {
        const user = users.getUser(socket.id);
        if (user && isValidString(message.text)) {
            io.to(user.room).emit(NEW_MESSAGE, generateMessage(user.username, message.text));
        }
        callback();
    });

    socket.on(CREATE_TOPIC, (topicString, callback) => {
        const user = users.getUser(socket.id);
        if (user && isValidString(topicString)) {
            topics.addTopic(topicString, user.username, user.room);
            io.to(user.room).emit(UPDATE_TOPIC_LIST, topics.getUnsortedTopicsList(user.room));
            return callback();
        }
        return callback('Problem with adding topic');
    });

    socket.on(ADD_TOPIC_VOTE, (topicString, callback) => {
        const user = users.getUser(socket.id);
        if (user && isValidString(topicString)) {
            topics.addVoter(topicString, user.username, user.room);
            io.to(user.room).emit(UPDATE_TOPIC_LIST, topics.getUnsortedTopicsList(user.room));
            return callback();
        }
        return callback('Problem with adding voter');
    });

    // socket.on(REMOVE_TOPIC_VOTE);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        const user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit(UPDATE_USER_LIST, users.getUserList(user.room));
            io.to(user.channel).emit(NEW_MESSAGE, generateMessage('Server', `${user.username} has left`));
        }
    });
});



// const accessControlConfig = require('./config/accessControlHeaderMiddleware.js');
// server.use(accessControlConfig);

routes(server);

module.exports = {
    server: httpServer,
    io
}
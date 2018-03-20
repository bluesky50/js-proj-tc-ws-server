// const path = require('path');
const http = require('http');
// const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const socketIO = require('socket.io');
const routes = require('./routes/index.js');

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
    // USER_CONNECTED,
    // USER_DISCONNECTED,
    JOIN_CHANNEL,
    UPDATE_USER_LIST,

    NEW_MESSAGE,
    CREATE_MESSAGE,
    
    NEW_CALL,
    CREATE_CALL,
    UPDATE_CALL,
    UPDATE_CALL_LIST,
    // OPEN_CALL, ARCHIVE_CALL, PEND_CALL, CLOSE_CALL

    UPDATE_SIGNALED_LIST,
    ADD_SIGNALED_USER,
    REMOVE_SIGNALED_USER,

    UPDATE_SUBJECT,
    SET_SUBJECT,

    CREATE_TOPIC,
    ADD_TOPIC_VOTE,
    REMOVE_TOPIC_VOTE,
    UPDATE_TOPIC_LIST,

    NEW_ANN
} = require('./helpers/socketEvents.js');

const { Users } = require('./socket/utils/users.js');
const { Topics } = require('./socket/utils/topicsV2.js');
const { Calls } = require('./socket/utils/calls.js');
const { SignaledUsers } = require('./socket/utils/signaledUsers.js');
const { Subjects } = require('./socket/utils/subjects.js');

const { generateMessage } = require('./socket/utils/message.js');
const { isValidString } = require('./socket/utils/validation.js');

let users = new Users();
let topics = new Topics();
let calls = new Calls();
let signaledUsers = new SignaledUsers();
let subjects = new Subjects();

const rms = ["blockchain", "cs3", "home", "lambda"];

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on(JOIN_CHANNEL, (userInfo, callback) => {
        if (!isValidString(userInfo.username) || !isValidString(userInfo.room || !rms.includes(userInfo.room))) {
            return callback('Valid username and room name are require');
        }

        socket.join(userInfo.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, userInfo.username, userInfo.room);

        io.to(userInfo.room).emit(UPDATE_USER_LIST, users.getUserList(userInfo.room));
        socket.emit(NEW_MESSAGE, generateMessage('Server', `You have joined ${userInfo.room} as ${userInfo.username}`));
        socket.broadcast.to(userInfo.room).emit(NEW_MESSAGE, generateMessage('Server', `${userInfo.username} has joined chat`));
        
        // on join emit an announcement
        socket.emit(NEW_ANN, 'Community members can now add trade calls.');

        // io.to(userInfo.room).emit(UPDATE_TOPIC_LIST, topics.getSortedTopicsList(userInfo.room));
        socket.emit(UPDATE_TOPIC_LIST, topics.getSortedTopicsList(userInfo.room));

        // on join emit calls
        // io.to(userInfo.room).emit(UPDATE_CALL_LIST, calls.getCalls(userInfo.room));
        socket.emit(UPDATE_CALL_LIST, calls.getCalls(userInfo.room));
        
        // on join emit signaled users
        // io.to(userInfo.room).emit(UPDATE_SIGNALED_LIST, signaledUsers.getUsers(userInfo.room));
        socket.emit(UPDATE_SIGNALED_LIST, signaledUsers.getUsers(userInfo.room));
        
        // on join emit pinned subject
        // io.to(userInfo.room).emit(UPDATE_SUBJECT, subjects.getSubject(userInfo.room));
        socket.emit(UPDATE_SUBJECT, subjects.getSubject(userInfo.room));

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

    socket.on(CREATE_CALL, (callInputObj, callback) => {
        const user = users.getUser(socket.id);
        if (user && isValidString(callInputObj.ticker)) {
            // console.log(callInputObj);
            let newCall;
            
            if (!calls._containsCall(callInputObj.ticker, user.username, user.room)) {
                newCall = calls.addCall(callInputObj, user.username, user.room);
                // console.log(newCall);
                io.to(user.room).emit(NEW_CALL, newCall);
                io.to(user.room).emit(NEW_ANN, `New call added (${callInputObj.ticker}) by ${user.username}.`);
            }

            return callback('Successfully created call.');
        }
        return callback("Problem with adding call");
    });

    // Currently configured to only update based on the status.
    // Can be modified later to update other fields of the  data.
    socket.on(UPDATE_CALL, (updateObj) => {
        const user = users.getUser(socket.id);
        if(user) {

            const c = calls.getCallById(updateObj._id, user.room);

            if (c.creator === user.username) {
                calls.updateCallById(updateObj, user.room);
                io.to(user.room).emit(UPDATE_CALL, updateObj);
                io.to(user.room).emit(NEW_ANN, `Call ${c.ticker}: ${updateObj.status} - ${user.username}.`);
            }
            
        }
    })

    socket.on(ADD_SIGNALED_USER, () => {
        const user = users.getUser(socket.id);
        if (user) {
            signaledUsers.addUser(user.username, user.room);
            io.to(user.room).emit(ADD_SIGNALED_USER, user.username);
        }
    });

    socket.on(REMOVE_SIGNALED_USER, () => {
        const user = users.getUser(socket.id);
        if (user) {
            signaledUsers.removeUser(user.username, user.room);
            io.to(user.room).emit(REMOVE_SIGNALED_USER, user.username);
        }
    });

    socket.on(SET_SUBJECT, (subjectStr, callback) => {
        const user = users.getUser(socket.id);
        if (user && subjectStr.length < 400) {
            subjects.setSubject(subjectStr, user.room);
            io.to(user.room).emit(UPDATE_SUBJECT, subjectStr);
            io.to(user.room).emit(NEW_MESSAGE, generateMessage('Server', `${user.username} set pinned subject to "${subjectStr}."`));
            return callback('Successfully changed subject');
        }
        return callback('Problem setting pinned subject');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        const user = users.removeUser(socket.id);

        if (user) {
            signaledUsers.removeUser(user.username, user.room);
            io.to(user.room).emit(REMOVE_SIGNALED_USER, user.username);
            io.to(user.room).emit(UPDATE_USER_LIST, users.getUserList(user.room));
            io.to(user.room).emit(NEW_MESSAGE, generateMessage('Server', `${user.username} has left`));
            
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
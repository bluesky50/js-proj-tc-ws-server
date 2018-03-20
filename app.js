require('./config/processConfig.js');

const { server } = require('./server.js');
const { SERVER_PORT } = require('./config/serverConfig.js');

const port = process.env.PORT || SERVER_PORT;

if (process.env.NODE_ENV === 'test') {
    server.listen(port, '10.10.10.4', () => {
        console.log('Server starting in test configuation');
        console.log(`Server started on port ${port}`);
    });
} else {
    server.listen(port, '10.10.10.4', () => {
        console.log('Server starting in non-test configuation');
        console.log(`Server started on port ${port}`);
    });
}
const testController = require('../controllers/testController.js');

module.exports = (server) => {
    server
        .route('/test')
        .get(testController.getHelloWorld);
    server  
        .route('/test')
        .post(testController.postHelloWorld);
}
const { SUCCESS, UNPROCESSABLE_ENTITY, SERVER_ERR } = require('../config/serverStatuses.js');

// TODO: add validation helpers
// TODO: add response helpers

const { handleServerError, handleInvalidInput } = require('../helpers/serverHelpers.js');

const getHelloWorld = (req, res) => {
    res.status(SUCCESS).send('helloWorld'); 
}

const postHelloWorld = (req, res) => {
    const { hi } = req.body;

    if (hi) {
        res.status(SUCCESS).send('helloWorld');
        return;
    }
    handleInvalidInput(res);
}

module.exports = {
    getHelloWorld,
    postHelloWorld
}
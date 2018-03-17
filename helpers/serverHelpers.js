const { SERVER_ERR, UNPROCESSABLE_ENTITY, SUCCESS } = require('../config/serverStatuses.js');

function handleInvalidInput(res) {
    const message = {
        message: 'Invalid input'
    }
    res.status(UNPROCESSABLE_ENTITY).json(message);
}

function handleServerError(res, err) {
    const error = {
        message: err.message
    }
    res.status(SERVER_ERR).json(error);
}

module.exports = {
    handleServerError,
    handleInvalidInput
}
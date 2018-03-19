const generateCall = (id, clientCallObjInput, username) => {
    const result = {
        _id: id,
        ...clientCallObjInput,
        creator: username,
        createdAt: new Date()
    }
    return result;
}

module.exports = {
    generateCall
}
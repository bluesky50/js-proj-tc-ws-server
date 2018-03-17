const generateTopic = (str, username) => {
    return {
        topic: str,
        voters: [username]
    };
}

const addVoterToTopic = (topic, username) => {
    if (!topic.voters.includes(username)) {
        topic.voters.push(username);
        return topic;
    }
    return topic;
}

module.exports = {
    generateTopic,
    addVoterToTopic
}
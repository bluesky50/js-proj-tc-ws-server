const { generateTopic, addVoterToTopic } = require('./topics.js');

// Major problem with how this data is stored.
class Topics {
    constructor() {
        this.topics = [];
    }

    _containsTopic(topicString, room) {
        for (let topicObj of this.topics) {
            if (topicObj.room === room && topicObj.topic === topicString) {
                return true;
            }
        }
        return false;
    }

    
    _getTopicIndex(topicString, room) {
        for (const [index, topic] of this.topics.entries()) {
            if (topic.topicString === topicString && topic.room === room) {
                return index;
            }
        }
    }

    _checkTopicPlace(idx) {
        if (this.topics.length > 1) {
            if (idx === 0) {
                if (this.topics[idx].voters.length < this.topics[idx+1].voters.length) {
                    const cachedTopic = this.topics[idx];
                    this.topics[idx] = this.topics[idx+1];
                    this.topics[idx+1] = cachedTopic;
                }
            } else if (idx < this.topics.length - 1) {
                if (this.topics[idx].voters.length < this.topics[idx+1].voters.length) {
                    const cachedTopic = this.topics[idx];
                    this.topics[idx] = this.topics[idx+1];
                    this.topics[idx+1] = cachedTopic;
                }
                if (this.topics[idx].voters.length > this.topics[idx-1].voters.length) {
                    const cachedTopic = this.topics[idx];
                    this.topics[idx] = this.topics[idx-1];
                    this.topics[idx-1] = cachedTopic;
                }
            } else {
                if (this.topics[idx].voters.length > this.topics[idx-1].voters.length) {
                    const cachedTopic = this.topics[idx];
                    this.topics[idx] = this.topics[idx-1];
                    this.topics[idx-1] = cachedTopic;
                }
            }
        }
    }

    addTopic(topicString, username, room) {
        if (!this._containsTopic(topicString, room)) {
            const topicObj = generateTopic(topicString, username, room);
            this.topics.push(topicObj);
        } else if (this._containsTopic(topicString, room)) {
            addVoterToTopic(this.getTopic(topicString, room), username);
            this._checkTopicPlace(this._getTopicIndex(topicString, room));   
        } else {
            console.log('Already added topic');
        }
    }

    getTopic(topicString, room) {
        for (let topicObj of this.topics) {
            if (topicObj.topic === topicString && topicObject.room === room) {
                return topicObj;
            }
        }
    }

    removeTopic(topicString, room) {
        const topic = this.getTopic(topicString, room);
        if (topic) {
            this.topics = this.topics.filter((t) => {
                return t.topic !== topicString && t.room !== room;
            });
        }
        return topic;
    }

    addVoter(topicString, username, room) {
        const topic = this.getTopic(topicString, room);
        addVoterToTopic(topic, username);
        this._checkTopicPlace(this._getTopicIndex(topicString, room));
    }

    // removeVoter() {

    // }

    // Not implemented.
    // Need to implement sort list.

    _sortTopics() {

    }

    getSortedTopicsList(room) {
        
    }

    getUnsortedTopicsList(room) {
        return this.topics.filter((t) => {
            return t.room === room;
        }).slice();
    }

    getAllTopics (room) {
        const topics = this.topics.filter((t) => {
            return t.room === room;
        });
    
        return topics;
    }
}

module.exports = {
    Topics
}
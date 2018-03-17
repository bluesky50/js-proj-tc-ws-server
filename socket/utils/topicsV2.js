const { generateTopic, addVoterToTopic } = require('./topics.js');

class Topics {
    constructor() {
        this.topics = {};
    }

    _containsTopic(topicString, room) {
        if (this.topics.hasOwnProperty(room)) {
            for (let topicObj of this.topics[room]) {
                if (topicObj.topic === topicString) {
                    return true;
                }
            }
            return false;    
        }
        return false;
    }

    
    _getTopicIndex(topicString, room) {
        for (const [index, topic] of this.topics[room].entries()) {
            if (topic.topic === topicString) {
                return index;
            }
        }
    }

    _checkTopicPlace(idx, room) {
        console.log(this.topics[room]);
        if (this.topics[room].length > 1) {
            if (idx === 0) {
                if (this.topics[room][idx].voters.length < this.topics[room][idx+1].voters.length) {
                    const cachedTopic = this.topics[room][idx];
                    this.topics[room][idx] = this.topics[room][idx+1];
                    this.topics[room][idx+1] = cachedTopic;
                }
            } else if (idx < this.topics[room].length - 1) {
                if (this.topics[room][idx].voters.length < this.topics[room][idx+1].voters.length) {
                    const cachedTopic = this.topics[room][idx];
                    this.topics[room][idx] = this.topics[room][idx+1];
                    this.topics[room][idx+1] = cachedTopic;
                }
                if (this.topics[room][idx].voters.length > this.topics[room][idx-1].voters.length) {
                    const cachedTopic = this.topics[room][idx];
                    this.topics[room][idx] = this.topics[room][idx-1];
                    this.topics[room][idx-1] = cachedTopic;
                }
            } else {
                if (this.topics[room][idx].voters.length > this.topics[room][idx-1].voters.length) {
                    const cachedTopic = this.topics[room][idx];
                    this.topics[room][idx] = this.topics[room][idx-1];
                    this.topics[room][idx-1] = cachedTopic;
                }
            }
        }
    }

    addTopic(topicString, username, room) {
        console.log(topicString,room);
        console.log(this.topics);
        if (!this._containsTopic(topicString, room)) {
            if (this.topics[room] === undefined) {
                const topicsArr = [{ topic: topicString, voters: [username] }] ;
                this.topics[room] = topicsArr;
            } else {
                this.topics[room].push({topic: topicString, voters:[username]});
            }
        } else if (this._containsTopic(topicString, room)) {
            const t = this.getTopic(topicString, room);
            if (!t.voters.includes(username)) {
                t.voters.push(username);
            }
            this._checkTopicPlace(this._getTopicIndex(topicString, room), room);   
        } else {
            console.log('Already added topic');
        }
    }

    getTopic(topicString, room) {
        for (let topicObj of this.topics[room]) {
            if (topicObj.topic === topicString) {
                return topicObj;
            }
        }
    }

    removeTopic(topicString, room) {
        const topic = this.getTopic(topicString, room);
        if (topic) {
            this.topics[room] = this.topics[room].filter((t) => {
                return t.topic !== topicString;
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
        if (this.topics[room] && this.topics[room].length > 9) {
            return this.topics[room].slice(0,10);
        }
        return this.topics[room];
    }

    getAllTopics (room) {
        return this.topics[room];
    }
}

module.exports = {
    Topics
}
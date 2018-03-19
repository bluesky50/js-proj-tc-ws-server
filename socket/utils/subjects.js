const MAX_LEN = 400;

class Subjects {
    constructor() {
        this.subjects = {}
    }

    setSubject(subjectStr, room) {
        if (subjectStr < MAX_LEN) {
            if (!this.subjects.hasOwnProperty(room)) {
                this.subjects[room] = subjectStr;
            } else {
                this.subjects[room] = subjectStr;
            }
        } else {
            console.log('Subject string was too long');
        }
    }

    getSubject(room) {
        if (!this.subjects.hasOwnProperty(room)) {
            return `Welcome to <${room}> chat room.`;
        }
        return this.subjects[room];
    }
}

module.exports = {
    Subjects
}
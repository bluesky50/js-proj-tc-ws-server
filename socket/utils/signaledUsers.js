class SignaledUsers {
    constructor() {
        this.signaledUsers = {};
    }

    _containsUser(username, room) {
        if (this.signaledUsers.hasOwnProperty(room)) {
            for (let u of this.signaledUsers[room]) {
                if (u.username === username) {
                    return true;
                }
            }
            return false;
        }
        return false
    }

    addUser(username, room) {
        if (!this.signaledUsers.hasOwnProperty(room)) {
            const newSU = [username];
            this.signaledUsers[room] = newSU; 
        } else {
            if (!this._containsUser(username, room)) {
                this.signaledUsers[room].push(username);
            } else {
                console.log('Signaled User already exists.');
            }
        }
    }

    removeUser(username, room) {
        if (this._containsUser(username, room)) {
            this.signaledUsers[room] = this.signaledUsers[room].filter((uname) => {
                return uname !== username;
            });
        }
    }

    getUsers(room) {
        if (!this.signaledUsers.hasOwnProperty(room)) {
            return [];
        }
        return this.signaledUsers[room];
    }
}

module.exports = {
    SignaledUsers
}
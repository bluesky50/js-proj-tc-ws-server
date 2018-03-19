const MAX_USERS = 16;

class Users {
    constructor() {
        this.users = [];
    }

    addUser(id, username, room) {
        const roomUsers = this.users.filter((u) => {
            return u.room === room;
        });

        if (roomUsers.length < MAX_USERS) {
            const user = { id, username, room };
            this.users.push(user);
            return user;
        }
    }

    removeUser(id) {
        const user = this.getUser(id);

        if (user) {
            this.users = this.users.filter((u) => {
                return u.id !== id;
            });
        }

        return user;
    }

    getUser(id) {
        for (let user of this.users) {
            if (user.id === id) {
                return user;
            }
        }
    }

    getUserList(room) {
        const users = this.users.filter((user) => {
            return user.room === room;
        });
        const namesArr = users.map((user) => {
            return user.username;
        });
        return namesArr;
    }
}

module.exports = {
    Users
}
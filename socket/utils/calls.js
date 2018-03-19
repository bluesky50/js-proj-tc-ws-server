const { generateCall } = require('./callHelpers.js');

const MAX_CALLS = 50;

const defaultTime = new Date();
const defaultData = [{
        _id: 100,
        creator: 'Crypto captain',
        createdAt: defaultTime,
        ticker: 'VEN/BTC',
        status: 'open',
        openPrice: '8500 sat',
        targetPrice: '9000 sat',
        term: 'Short Term',
        risk: 'Intermediate',
        exchange: 'Binance',
        note: 'Looking for 5% gain, but will close if changes direction.'
    }, {
        _id: 101,
        creator: 'Block boss',
        createdAt: defaultTime,
        ticker: 'EOS/BTC',
        status: 'open',
        openPrice: '8500 sat',
        targetPrice: '9000 sat',
        term: 'Mid Term',
        risk: 'Intermediate',
        exchange: 'Binance',
        note: 'Looking for 5% gain, but will close if changes direction.'
    }, {
        _id: 102,
        creator: 'xHodl-Lifex',
        createdAt: defaultTime,
        ticker: 'ICX/BTC',
        status: 'closed',
        openPrice: '8500 sat',
        targetPrice: '9000 sat',
        term: 'Short Term',
        risk: 'High',
        exchange: 'Binance',
        note: 'Looking for 5% gain, but will close if changes direction.'
    }, {
        _id: 103,
        creator: 'maximilian',
        createdAt: defaultTime,
        ticker: 'LTC/BTC',
        status: 'pending',
        openPrice: '8500 sat',
        targetPrice: '9000 sat',
        term: 'Short Term',
        risk: 'Intermediate Risk',
        exchange: 'Binance',
        note: 'Looking for 5% gain, but will close if changes direction.'
    }];

class Calls {
    constructor() {
        this.idCounter = 0;
        this.calls = {
            'blockchain': defaultData,
            'lambda': defaultData
        };
    }

    _containsCall(callTicker, creatorUsername, room) {
        if (this.calls.hasOwnProperty(room)) {
            for (let callObj of this.calls[room]) {
                if (callObj.ticker.toLowerCase() === callTicker.toLowerCase() && callObj.creator === creatorUsername) {
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    _getCallIndex(callTicker, creatorUsername, room) {
        for (const [index, call] of this.calls[room].entries()) {
            if (call.ticker === callTicker) {
                return index;
            }
        }
    }

    addCall(callInputObject, creatorUsername, room) {
        const newCall = generateCall(this.idCounter, callInputObject, creatorUsername);
        // console.log(newCall);
        if (!this.calls.hasOwnProperty(room)) {
            const callsArray = [newCall];
            this.calls[room] = callsArray; 
            this.idCounter += 1;
        } else if (!this._containsCall(callInputObject.ticker, creatorUsername, room)) {
            if (this.calls[room].length < MAX_CALLS) {
                this.calls[room].push(newCall);
                this.idCounter += 1;
            } else {
                const slicedCalls = this.calls[room].slice(Math.floor(MAX_CALLS/2));
                slicedCalls.push(newCall);
                this.calls[room] = slicedCalls;
                this.idCounter += 1;
            }
        } else {
            console.log('Call ready exists.');
        }
        return newCall;
    }

    getCall(callTicker, creatorUsername, room) {
        for (let callObj of this.calls[room]) {
            if (callObj.ticker === callTicker && callObj.creator === creatorUsername) {
                return callObj;
            }
        }
    }

    removeCall(callTicker, creatorUsername, room) {
        const call = this.getCall(callTicker, creatorUsername, room);
        if (call) {
            this.calls[room] = this.calls[room].filter((c) => {
                return c.ticker !== callTicker && c.creator !== creatorUsername;
            });
        }
        return call;
    }

    getCalls(room) {
        if (!this.calls.hasOwnProperty(room)) {
            return [];
        }
        return this.calls[room];
    }

    updateCall(callInputObject, creatorUsername, room) {
        const i = this._getCallIndex(callInputObject.ticker, creatorUsername, room);
        if (i) {
            this.calls[room][i] = { ...this.calls[room][i], ...callInputObject };
        }
    }

    openCall(callTicker, creatorUsername, room) {
        const updatedCall = getCall(callTicker, creatorUsername, room).status = 'open';
        return updatedCall;
    }

    archiveCall(callTicker, creatorUsername, room) {
        const updatedCall = getCall(callTicker, creatorUsername, room).status = 'archive';
        return updatedCall;
    }

    closeCall(callTicker, creatorUsername, room) {
        const updatedCall = getCall(callTicker, creatorUsername, room).status = 'close';
        return updatedCall;
    }

    pendCall(callTicker, creatorUsername, room) {
        const updatedCall = getCall(callTicker, creatorUsername, room).status = 'pending';
        return updatedCall;
    }
}

module.exports = {
    Calls
}
const HttpError = require('./httpError');

const foundOr404 = (record, message) => {
    if (!record) {
        throw new HttpError(404, message);
    }
    return record;
};

module.exports = foundOr404;

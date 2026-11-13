// Só os campos permitidos: o cliente não altera id, active... mandando no JSON.
const pick = (source, fields) => {
    const result = {};
    for (const field of fields) {
        if (source?.[field] !== undefined) {
            result[field] = source[field];
        }
    }
    return result;
};

module.exports = pick;

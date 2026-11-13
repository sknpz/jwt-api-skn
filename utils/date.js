const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Fuso local: toISOString() usa UTC e à noite já daria o dia seguinte.
const today = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
};

const addDays = (date, days) => {
    return new Date(new Date(date).getTime() + days * ONE_DAY_MS).toISOString().slice(0, 10);
};

const daysBetween = (start, end) => {
    return Math.round((new Date(end) - new Date(start)) / ONE_DAY_MS);
};

module.exports = { today, addDays, daysBetween };

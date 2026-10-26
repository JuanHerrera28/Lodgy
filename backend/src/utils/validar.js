const esFecha = (v) =>
    typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

const esEntero = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

module.exports = { esFecha, esEntero };
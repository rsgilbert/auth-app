const db = require('../db.js')
const { InvoiceNumber } = require('invoice-number')
/**
 * Returns the next number in the series for a given code.
 * Increase the last_no in the no_series table by one.
 * @param {string} code 
 * @returns {Promise<string>} next no
 */
const nextNoFor = async (code) => {
    let stmt = 'SELECT * FROM no_series WHERE code = ?'
    let values = [code]
    /** @type {NoSeries[]} */
    const [no_serie] = await db.query(conn => conn.query(stmt, values))
    if(!no_serie) {
        throw Error('No no_series with code ' + code)
    }
    const nextNo = InvoiceNumber.next(no_serie.last_no)
    stmt = 'UPDATE no_series SET last_no = ? WHERE code = ?'
    values = [nextNo, code]
    await db.query(conn => conn.query(stmt, values))
    return nextNo
}


module.exports = {
    nextNoFor
}

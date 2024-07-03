const config = require('./config.js')
const moment = require('moment-timezone')
const { roundCurrency } = require('./helpers.js')

class Customer {
  constructor({ id, userType }) {
    this.id = id;
    this.userType = userType;
    this.proceededOperations = {
      EUR: {
        cash_out: [],
        cash_in: [],
      }
    };
  }

  saveInfoAboutProceedingOperation({ operationType, currency, date, amount }) {
    if(!this.proceededOperations[currency]) {
      this.proceededOperations[currency] = {
        cash_out: [],
        cash_in: [],
      }
    }
    this.proceededOperations[currency][operationType].push({
      date,
      amount
    })
  }
}

module.exports = Customer

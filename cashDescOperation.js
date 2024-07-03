const config = require('./config.js')
const moment = require('moment-timezone')
const { roundCurrency } = require('./helpers.js')

class CashDescOperation {
  constructor({ userType, proceededOperations }) {
    this.userType = userType;
    this.proceededOperations = proceededOperations;
    this.roundCurrency = roundCurrency
  }

  async getCashOperationConfig({ operationType, currency }) {
    try {
      return config[currency][operationType][this.userType]()
    } catch (err) {
      console.log('ERROR: unknown operation')
      return null
    }
  }

  getWeekAmount({ operationType, currency, date }) {
    const operations = this.proceededOperations[currency]?.[operationType]
    
    if(!operations.length) return 0

    let i = operations.length - 1
    let sum = 0
    const weekStartDate = moment(date).startOf('isoWeek')
    // for best results need to use timezone of customer

    while (i >= 0 && moment(operations[i].date) >= weekStartDate ) {
      sum += operations[i].amount
      i -= 1
    }

    return sum
  }
  
  async proceed({ currency, date, amount, type }) {
    try {
      const {
        percents,
        max,
        min,
        week_limit
      } = await this.getCashOperationConfig({ operationType: type, currency })

      let fee = amount * percents / 100 // default fee
      if(max && max.amount < fee ) { // can not be more then MAX
        fee = max.amount
      }
      if(min && min.amount > fee ) { // can not be less then MIN
        fee = min.amount
      }
      if(week_limit) {
        const weekAmount = this.getWeekAmount({ operationType: type, currency, date })
        const amountOverLimit = weekAmount + amount - week_limit.amount
        fee = amountOverLimit > 0 ? Math.min(amountOverLimit, amount) * percents / 100 : 0
      }

      fee = this.roundCurrency({ val: fee, smallestPart: config[currency].smallestPart })
    
      return { 
        fee,
        operationType: type,
        currency,
        date,
        amount
      }
    } catch (err) {
      console.log(err)
      return null
    }
  }
}

module.exports = CashDescOperation

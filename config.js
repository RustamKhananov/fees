const {
  getCashInConfig,
  getNaturalCashOutConfig,
  getJuridicalCashOutConfig
} =require('./api')

module.exports = {
  EUR: {
    cash_in: {
      natural: getCashInConfig,
      juridical: getCashInConfig,
    },
    cash_out: {
      natural: getNaturalCashOutConfig,
      juridical: getJuridicalCashOutConfig,
    },
    smallestPart: 0.01,
  }
}

const fetch = require("node-fetch");

const getCashInConfig = () => {
  return fetch('https://developers.paysera.com/tasks/api/cash-in').then(res => res.json())
}

const getNaturalCashOutConfig = () => {
  return fetch('https://developers.paysera.com/tasks/api/cash-out-natural').then(res => res.json())
}

const getJuridicalCashOutConfig = () => {
  return fetch('https://developers.paysera.com/tasks/api/cash-out-juridical').then(res => res.json())
}

module.exports = {
  getCashInConfig,
  getNaturalCashOutConfig,
  getJuridicalCashOutConfig
}
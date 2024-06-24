const fs = require('fs');
const Customer = require('./customer')

const inputFilePath = process.argv[2];

const cashDescOperations = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
const sortedCashDescOperations = cashDescOperations.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

const proceedAllOperations = async () => {
  let customersMapToId = {}

  for (const cashDescOperation of sortedCashDescOperations) {
    const {
      date,
      user_id: userId,
      user_type: userType,
      type,
      operation: {
        amount,
        currency
      }
    } = cashDescOperation

    if (!customersMapToId[userId]) {
      customersMapToId[userId] = new Customer({ id: userId, userType })
    }

    const fee = await customersMapToId[userId].proceedCashDeskOperation({
      currency,
      date,
      amount,
      type
    })

    console.log(fee)
  }
}



proceedAllOperations()

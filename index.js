const fs = require('fs');
const Customer = require('./customer')
const CashDescOperation = require('./cashDescOperation')

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

    const operation = new CashDescOperation({ 
      userType,
      proceededOperations: customersMapToId[userId].proceededOperations
    })

    const operationResult = await operation.proceed({
      currency,
      date,
      amount,
      type
    })

    customersMapToId[userId].saveInfoAboutProceedingOperation(operationResult)

    console.log(operationResult.fee)
  }
}



proceedAllOperations()

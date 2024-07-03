const CashDescOperation = require('../cashDescOperation')

describe('CashDescOperation class', () => {
  let operation;

  beforeEach(() => {
    operation = new CashDescOperation({ userType: 'natural', proceededOperations: {
      EUR: {
        cash_out: [],
        cash_in: [],
      }
    } });  });

  it('should fetch cash operation config', async () => {
    operation.getCashOperationConfig = jest.fn(() => ({
      percents: 0.3,
      week_limit: {
        amount: 1000,
        currency: 'EUR'
      }
    }))
    await operation.proceed({
      currency: 'EUR',
      date: '2023-05-06',
      amount: 10,
      type: 'cash_out'
    });

    expect(operation.getCashOperationConfig).toHaveBeenCalledTimes(1);
  });

  it('should round result', async () => {
    operation.roundCurrency = jest.fn(() => {})
    operation.getCashOperationConfig = jest.fn(() => ({
      percents: 0.3,
      week_limit: {
        amount: 1000,
        currency: 'EUR'
      }
    }))
    await operation.proceed({
      currency: 'EUR',
      date: '2023-05-06',
      amount: 10,
      type: 'cash_out'
    });

    expect(operation.roundCurrency).toHaveBeenCalledTimes(1);
  });

  it('should return fee less than MAX', async () => {
    const configMock = {
      percents: 0.3,
      max: {
        amount: 10,
        currency: 'EUR'
      }
    }
    operation.getCashOperationConfig = jest.fn(() => configMock)
    const fee = await operation.proceed({
      currency: 'EUR',
      date: '2023-05-06',
      amount: 10000000000000000000000,
      type: 'cash_out'
    });

    expect(fee).toEqual({
      amount: 10000000000000000000000,
      currency: "EUR",
      date: "2023-05-06",
      fee: configMock.max.amount,
      operationType: "cash_out"
    });
  });

  it('should return fee more than MIN (if NO week_limit)', async () => {
    const configMock = {
      percents: 0.3,
      max: {
        amount: 10,
        currency: 'EUR'
      },
      min: {
        amount: 1,
        currency: 'EUR'
      }
    }
    operation.getCashOperationConfig = jest.fn(() => configMock)
    const fee = await operation.proceed({
      currency: 'EUR',
      date: '2023-05-06',
      amount: 1,
      type: 'cash_out'
    });

    expect(fee).toEqual({"amount": 1, "currency": "EUR", "date": "2023-05-06", "fee": configMock.min.amount, "operationType": "cash_out"});
  });

  it('should be able to calculate week amount', () => {
    operation.proceededOperations.EUR.cash_out = [
      { date: '2023-04-30', amount: 10 },
      { date: '2023-05-03', amount: 20 },
      { date: '2023-05-05', amount: 30 },
    ];

    const result = operation.getWeekAmount({
      operationType: 'cash_out',
      currency: 'EUR',
      date: '2023-05-06'
    });

    expect(result).toBe(50);
  });

  it('should return 0 if week_limit was not exceeded', async () => {
    operation.proceededOperations.EUR.cash_out = [
      { date: '2023-04-30', amount: 10 },
      { date: '2023-05-03', amount: 20 },
      { date: '2023-05-05', amount: 30 },
    ];

    const configMock = {
      percents: 0.3,
      max: {
        amount: 10,
        currency: 'EUR'
      },
      week_limit: {
        amount: 1000,
        currency: 'EUR'
      }
    }
    operation.getCashOperationConfig = jest.fn(() => configMock)
    const fee = await operation.proceed({
      currency: 'EUR',
      date: '2023-05-06',
      amount: 100,
      type: 'cash_out'
    });

    expect(fee).toEqual({
      amount: 100,
      currency: "EUR",
      date: "2023-05-06",
      fee: 0,
      operationType: "cash_out"
    });
  });

  it('should return default fee if week_limit was exceeded', async () => {
    operation.proceededOperations.EUR.cash_out = [
      { date: '2023-04-30', amount: 1000 },
      { date: '2023-05-03', amount: 20 },
      { date: '2023-05-05', amount: 30 },
    ];

    const configMock = {
      percents: 0.3,
      max: {
        amount: 10,
        currency: 'EUR'
      },
      week_limit: {
        amount: 1000,
        currency: 'EUR'
      }
    }
    operation.getCashOperationConfig = jest.fn(() => configMock)
    const fee = await operation.proceed({
      currency: 'EUR',
      date: '2023-05-06',
      amount: 1000,
      type: 'cash_out'
    });

    expect(fee).toEqual({"amount": 1000, "currency": "EUR", "date": "2023-05-06", "fee": 0.15, "operationType": "cash_out"});
  });

});

const Customer = require('../customer')

describe('Customer class', () => {
  let customer;

  beforeEach(() => {
    customer = new Customer({ id: '123', userType: 'natural' });
  });

  it('should fetch cash operation config', async () => {
    customer.getCashOperationConfig = jest.fn(() => ({
      percents: 0.3,
      week_limit: {
        amount: 1000,
        currency: 'EUR'
      }
    }))
    await customer.proceedCashDeskOperation({
      currency: 'EUR',
      date: '2023-05-06',
      amount: 10,
      type: 'cash_out'
    });

    expect(customer.getCashOperationConfig).toHaveBeenCalledTimes(1);
  });

  it('should round result', async () => {
    customer.roundCurrency = jest.fn(() => {})
    await customer.proceedCashDeskOperation({
      currency: 'EUR',
      date: '2023-05-06',
      amount: 10,
      type: 'cash_out'
    });

    expect(customer.roundCurrency).toHaveBeenCalledTimes(1);
  });

  it('should return fee less than MAX', async () => {
    const configMock = {
      percents: 0.3,
      max: {
        amount: 10,
        currency: 'EUR'
      }
    }
    customer.getCashOperationConfig = jest.fn(() => configMock)
    const fee = await customer.proceedCashDeskOperation({
      currency: 'EUR',
      date: '2023-05-06',
      amount: 10000000000000000000000,
      type: 'cash_out'
    });

    expect(fee).toBe(configMock.max.amount);
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
    customer.getCashOperationConfig = jest.fn(() => configMock)
    const fee = await customer.proceedCashDeskOperation({
      currency: 'EUR',
      date: '2023-05-06',
      amount: 1,
      type: 'cash_out'
    });

    expect(fee).toBe(configMock.min.amount);
  });

  it('should be able to save info about proceeding operation', () => {
    customer.saveInfoAboutProceedingOperation({
      operationType: 'cash_out',
      currency: 'EUR',
      date: '2023-05-01',
      amount: 10
    });

    expect(customer.proceededOperations.EUR.cash_out).toEqual([{
      date: '2023-05-01',
      amount: 10
    }]);
  });

  it('should be able to calculate week amount', () => {
    customer.proceededOperations.EUR.cash_out = [
      { date: '2023-04-30', amount: 10 },
      { date: '2023-05-03', amount: 20 },
      { date: '2023-05-05', amount: 30 },
    ];

    const result = customer.getWeekAmount({
      operationType: 'cash_out',
      currency: 'EUR',
      date: '2023-05-06'
    });

    expect(result).toBe(50);
  });

  it('should return 0 if week_limit was not exceeded', async () => {
    customer.proceededOperations.EUR.cash_out = [
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
    customer.getCashOperationConfig = jest.fn(() => configMock)
    const fee = await customer.proceedCashDeskOperation({
      currency: 'EUR',
      date: '2023-05-06',
      amount: 100,
      type: 'cash_out'
    });

    expect(fee).toBe(0);
  });

  it('should return default fee if week_limit was exceeded', async () => {
    customer.proceededOperations.EUR.cash_out = [
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
    customer.getCashOperationConfig = jest.fn(() => configMock)
    const fee = await customer.proceedCashDeskOperation({
      currency: 'EUR',
      date: '2023-05-06',
      amount: 1000,
      type: 'cash_out'
    });

    expect(fee).toBe(0.15);
  });

});
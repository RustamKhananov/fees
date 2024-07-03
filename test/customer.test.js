const Customer = require('../customer')

describe('Customer class', () => {
  let customer;

  beforeEach(() => {
    customer = new Customer({ id: '123', userType: 'natural' });
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

});

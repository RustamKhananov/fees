const { roundCurrency } = require('../helpers')

describe('roundCurrency', () => {
  beforeEach(() => {})

  test('rounds currency correctly for 0.1', () => {
    const result = roundCurrency({ val: 9.849, smallestPart: 0.1 })
    expect(result).toBe(9.9)
  })
  test('rounds currency correctly for 0.01', () => {
    const result = roundCurrency({ val: 9.841, smallestPart: 0.01 })
    expect(result).toBe(9.85)
  })
})
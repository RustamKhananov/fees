const roundCurrency = ({ val, smallestPart }) => {
  const smallestPartsCount = 1 / smallestPart
  return Math.ceil(val * smallestPartsCount) / smallestPartsCount
}

module.exports = {
  roundCurrency
}
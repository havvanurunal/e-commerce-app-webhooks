export function formatOrderId(id: string): string {
  const lastEightCharacter = id.slice(-8)
  const formattedOrderId = '#' + lastEightCharacter.toUpperCase()
  return formattedOrderId
}

export const truncate = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

export const capitalize = (text: string) => {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

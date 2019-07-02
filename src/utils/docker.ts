export const parseLog = (buffer: Buffer): string[] => {
  return buffer.toString()
    .split('\n')
    .map(x => x.substring(8)) // Skip the 8 characters that docker put in front of its logs
    .filter(x => x)
}

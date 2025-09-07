export function isParseEnabled(): boolean {
  // Default ON everywhere unless explicitly turned off.
  const flag = process.env.NEXT_PUBLIC_FLAG_PARSE ?? process.env.FLAG_PARSE;
  return flag !== 'off';
}

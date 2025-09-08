export function isParseEnabled(): boolean {
  // Default ON everywhere unless explicitly turned off.
  const flag = process.env.NEXT_PUBLIC_FLAG_PARSE ?? process.env.FLAG_PARSE;
  return flag !== 'off';
}

export function isCanonicalEnabled(): boolean {
  const flag =
    process.env.NEXT_PUBLIC_FLAG_CANONICAL ??
    process.env.FLAG_CANONICAL ??
    'off';
  return flag === 'on';
}

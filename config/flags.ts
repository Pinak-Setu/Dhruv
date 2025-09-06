export function isParseEnabled(): boolean {
  const isProd = process.env.NODE_ENV === 'production';
  const flag = process.env.FLAG_PARSE;
  return flag === 'on' || (!isProd && flag !== 'off');
}

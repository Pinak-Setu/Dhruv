export function isParseEnabled(): boolean {
  const isProd = process.env.NODE_ENV === 'production';
  const flag = process.env.NEXT_PUBLIC_FLAG_PARSE ?? process.env.FLAG_PARSE;
  return flag === 'on' || (!isProd && flag !== 'off');
}

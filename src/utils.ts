export function getEnv(name: string): string {
  let value = process.env[name];
  if (typeof value === 'string') {
    return value;
  }

  throw new Error(`Missing environment variable ${name}`);
}

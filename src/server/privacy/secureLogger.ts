type LogLevel = 'info' | 'warn' | 'error';

function log(level: LogLevel, message: string): void {
  const prefix = `[LPM Privacy ${level.toUpperCase()}]`;
  if (level === 'error') {
    console.error(prefix, message);
  } else if (level === 'warn') {
    console.warn(prefix, message);
  } else {
    console.info(prefix, message);
  }
}

export const secureLog = {
  info: (message: string) => log('info', message),
  warn: (message: string) => log('warn', message),
  error: (message: string) => log('error', message),
};

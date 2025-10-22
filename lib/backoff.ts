type BackoffOptions = {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
};

export async function withBackoff<T>(
  task: () => Promise<T>,
  { retries = 3, baseDelayMs = 300, maxDelayMs = 4000 }: BackoffOptions = {},
): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= retries) {
        throw error;
      }
      const delay = Math.min(
        maxDelayMs,
        baseDelayMs * Math.pow(2, attempt) + jitter(),
      );
      await sleep(delay);
    }
  }
}

function jitter() {
  return Math.floor(Math.random() * 200);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

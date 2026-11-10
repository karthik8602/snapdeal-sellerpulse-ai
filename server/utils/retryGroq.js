export const retryGroqRequest = async (request, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await request();
    } catch (error) {
      if (error.status !== 429 || attempt === retries) {
        throw error;
      }

      const retryAfter = Number(error.headers?.get("retry-after"));

      const delay = Math.min((retryAfter || 2) * 1000, 10000);

      console.log(`Groq rate limit reached. Retrying in ${delay}ms...`);

      await new Promise((resolve) => setTimeout(resolve, delay + 300));
    }
  }
};

import axios from "axios";
import axiosRetry from "axios-retry";

const SCRAPE_TOKEN = process.env.SCRAPE_TOKEN;

const surflineClient = axios.create({
  baseURL: "https://services.surfline.com",
  timeout: 30000, 
});

// --- 1. SETUP RETRY LOGIC ---
axiosRetry(surflineClient, {
  retries: 2, // Try 3 times total
  retryDelay: (retryCount) => {
    console.log(`Retry attempt #${retryCount}...`);
    return retryCount * 1000; // Wait 1s, then 2s
  },
  // Only retry if it's a network error or a 5xx server error
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  },
});

// --- 2. SETUP PROXY INTERCEPTOR ---
surflineClient.interceptors.request.use((config) => {
  // Only proxy requests that aren't already going to the proxy API
  if (config.baseURL !== "https://api.scrape.do") {
    const targetUrl = axios.getUri(config);

    config.baseURL = "https://api.scrape.do";
    config.url = "/";
    config.params = {
      token: SCRAPE_TOKEN,
      url: targetUrl,
      // Change 'super' to true if Surfline still blocks Railway
      super: false, 
    };
  }
  return config;
});

export { surflineClient };
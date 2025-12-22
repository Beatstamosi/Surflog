import axios from 'axios';

const surflineClient = axios.create({
  baseURL: 'https://services.surfline.com',
  timeout: 10000, // Crucial for production
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.surfline.com/',
    'Origin': 'https://www.surfline.com',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
  }  // <-- THIS WAS MISSING
});  // <-- This closes the create() method

// Add a request interceptor for retries
surflineClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Prevent infinite retry loops
    if (!config || config.__retryCount >= 3) {
      return Promise.reject(error);
    }
    
    config.__retryCount = (config.__retryCount || 0) + 1;
    
    // Wait before retrying (exponential backoff: 1s, 2s, 4s)
    const delay = 1000 * Math.pow(2, config.__retryCount - 1);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry the request
    return surflineClient(config);
  }
);

export { surflineClient };
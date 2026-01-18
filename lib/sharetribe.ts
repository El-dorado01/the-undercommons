import { createInstance } from 'sharetribe-flex-sdk';

const validClientId = process.env.NEXT_PUBLIC_SHARETRIBE_SDK_CLIENT_ID;

if (!validClientId) {
  console.warn(
    'Sharetribe SDK Client ID is missing. The SDK will not function correctly.',
  );
}

// Initialize the Sharetribe SDK instance
export const sharetribeSdk = createInstance({
  clientId: validClientId || 'demo-client-id', // Fallback to avoid crash during build if env is missing
  baseUrl: 'https://flex-api.sharetribe.com', // Default base URL, can be overridden if needed
});

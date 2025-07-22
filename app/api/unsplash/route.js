import axios from 'axios';

export async function GET() {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    
    console.log('Unsplash API called, access key present:', !!accessKey);
    
    if (!accessKey) {
      console.error('Unsplash access key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'Unsplash API key not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Making request to Unsplash API...');
    const response = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        client_id: accessKey,
        count: 1,
        query: 'animals',
      },
    });

    console.log('Unsplash API response status:', response.status);
    const photo = response.data[0] || response.data;

    if (!photo || !photo.urls) {
      console.error('Invalid photo data received from Unsplash:', photo);
      return new Response(
        JSON.stringify({ error: 'No valid photo data received from Unsplash' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully fetched image:', photo.urls.small);
    return new Response(
      JSON.stringify({
        url: photo.urls.small,
        alt_description: photo.alt_description || 'No description available',
        attribution: {
          photographer: photo.user.name,
          photographerUsername: photo.user.username,
          photographerProfile: `https://unsplash.com/@${photo.user.username}?utm_source=PromptrNew&utm_medium=referral`,
          unsplashUrl: `https://unsplash.com/?utm_source=PromptrNew&utm_medium=referral`,
          imageUrl: `https://unsplash.com/photos/${photo.id}?utm_source=PromptrNew&utm_medium=referral`
        }
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unsplash API error:', error.message);
    console.error('Error details:', error.response?.data || error);
    
    // Handle specific error cases
    if (error.response?.status === 403) {
      console.error('Unsplash API access denied - check API key');
      return new Response(
        JSON.stringify({ 
          error: 'Unsplash API rate limit exceeded or access denied',
          details: 'Please try again in a few moments',
          retryAfter: error.response.headers?.['retry-after'] || '60'
        }),
        { 
          status: 429, // Use 429 for rate limiting
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    if (error.response?.status === 401) {
      console.error('Unsplash API unauthorized - invalid API key');
      return new Response(
        JSON.stringify({ 
          error: 'Unsplash API unauthorized',
          details: 'Invalid API key'
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch image from Unsplash',
        details: error.response?.data?.errors || error.message,
        status: error.response?.status || 'Unknown',
        type: error.constructor.name
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

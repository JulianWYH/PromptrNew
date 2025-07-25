This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## API Documentation

The project includes example API endpoints that demonstrate both GET and POST requests.

### Example API Endpoints

#### GET Request
- **Endpoint:** `/api/example`
- **Method:** GET
- **Description:** Returns a simple JSON response with a message and timestamp
- **Response Example:**
```json
{
  "message": "Hello from the GET endpoint!",
  "timestamp": "2024-04-23T12:34:56.789Z",
  "status": "success"
}
```

#### POST Request
- **Endpoint:** `/api/example`
- **Method:** POST
- **Description:** Accepts JSON data and returns it along with a success message
- **Request Example:**
```json
{
  "name": "John Doe",
  "age": 30
}
```
- **Response Example:**
```json
{
  "message": "Data received successfully!",
  "receivedData": {
    "name": "John Doe",
    "age": 30
  },
  "timestamp": "2024-04-23T12:34:56.789Z",
  "status": "success"
}
```

### Testing the API

You can test these endpoints using:
1. Browser (for GET requests)
2. Postman
3. cURL
4. Fetch API in JavaScript

Example using fetch:
```javascript
// GET request
fetch('/api/example')
  .then(response => response.json())
  .then(data => console.log(data));

// POST request
fetch('/api/example', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    age: 30
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
#   P r o m p t r N e w  
 
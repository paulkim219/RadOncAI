# RadOncAI Backend

Express.js API server for RadOncAI application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
OPENAI_API_KEY=your-openai-api-key-here
PORT=3000
```

3. Start the server:
```bash
npm start
```

## API Endpoints

- `POST /api/chat` - Chat endpoint for AI interactions
- `GET /health` - Health check endpoint

## Deployment

See `../DEPLOYMENT.md` for AWS EC2 deployment instructions.


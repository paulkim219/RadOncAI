# RadOncAI Frontend

Static frontend application for RadOncAI, deployed on AWS Amplify.

## Structure

- `public/` - All static files (HTML, CSS, JS, images)
- `amplify.yml` - AWS Amplify build configuration

## Local Development

For local development, the `config.js` file defaults to `http://localhost:3000`.

You can serve the files using any static file server:
```bash
cd public
python -m http.server 8080
# or
npx serve public
```

## Deployment

See `../DEPLOYMENT.md` for AWS Amplify deployment instructions.

## Configuration

The API endpoint is configured via `config.js`, which is generated at build time in AWS Amplify using the `API_BASE_URL` environment variable.


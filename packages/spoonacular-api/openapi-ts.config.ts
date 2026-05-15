import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input:
    'https://raw.githubusercontent.com/ddsky/spoonacular-api-clients/refs/heads/master/spoonacular-openapi-3.json',
  output: {
    path: 'src/client',
    postProcess: ['prettier'],
  },
  plugins: [
    'zod',
    {
      name: '@hey-api/sdk',
      validator: true,
    },
  ],
});

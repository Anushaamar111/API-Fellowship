import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import yaml from 'js-yaml';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book API',
      version: '1.0.0',
      description: 'API for managing books - Fellowship Project',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
      {
        url: 'https://api-fellowship.herokuapp.com',
        description: 'Production server',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Write the OpenAPI spec to both JSON and YAML files
fs.writeFileSync('./openapi.json', JSON.stringify(swaggerSpec, null, 2));
fs.writeFileSync('./openapi.yaml', yaml.dump(swaggerSpec));

console.log('OpenAPI specification generated successfully!');
console.log('Files created: openapi.json, openapi.yaml');

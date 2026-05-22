const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'CJ Backend API',
    version: '1.0.0',
    description: 'API documentation for the CJ backend service',
  },
  servers: [
    // {
    //   url: `http://localhost:${process.env.PORT || 3000}`,
    //   description: 'Local server',
    // },
    {
      url: `https://cracker-junction.onrender.com`,
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(swaggerOptions);
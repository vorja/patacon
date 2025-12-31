import swaggerJsdoc from "swagger-jsdoc";

export const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API – Sistema de Gestión de Producción",
      version: "1.0.0",
      description: `
Documentación técnica oficial de la API REST.

- Autenticación JWT
- Control de acceso ACL
- Arquitectura modular
      `,
    },
    servers: [
      {
        url: "/api",
        description: "Servidor principal",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/**/*.js"],
};

swaggerJsdoc(options);

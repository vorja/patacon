FROM node:20-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Etapa de producción
FROM node:20-alpine

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init wget

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copiar dependencias desde builder
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules

# Copiar código de la aplicación
COPY --chown=nodejs:nodejs . .

# Variables de entorno
ENV NODE_ENV=production \
    PORT=3105

# Healthcheck endpoint (agregar en tu app)
# app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

USER nodejs

EXPOSE 3105

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "start"]
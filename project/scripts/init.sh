#!/bin/bash

set -e

echo "🚀 Inicializando proyecto Agrícola Patacón..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi

# Crear directorios necesarios
echo -e "${YELLOW}📁 Creando directorios...${NC}"
mkdir -p ./mysql
mkdir -p ./nginx
mkdir -p ./scripts

# Detener contenedores existentes
echo -e "${YELLOW}🛑 Deteniendo contenedores existentes...${NC}"
docker-compose down -v 2>/dev/null || true

# Limpiar volúmenes antiguos (opcional)
read -p "¿Deseas limpiar los volúmenes existentes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗑️  Limpiando volúmenes...${NC}"
    docker-compose down -v
fi

# Construir imágenes
echo -e "${YELLOW}🏗️  Construyendo imágenes...${NC}"
docker-compose build --no-cache

# Iniciar servicios
echo -e "${YELLOW}🚀 Iniciando servicios...${NC}"
docker-compose up -d

# Esperar a que MySQL esté listo
echo -e "${YELLOW}⏳ Esperando a que MySQL esté listo...${NC}"
until docker-compose exec -T db mysqladmin ping -h localhost -u root -proot &> /dev/null; do
    printf '.'
    sleep 2
done
echo -e "\n${GREEN}✅ MySQL está listo${NC}"

# Limpiar caché de Laravel primero
echo -e "${YELLOW}🧹 Limpiando caché de Laravel...${NC}"
docker-compose exec -T app php artisan config:clear || true
docker-compose exec -T app php artisan cache:clear || true
docker-compose exec -T app php artisan view:clear || true

# Ejecutar migraciones de Laravel
echo -e "${YELLOW}📦 Ejecutando migraciones de Laravel...${NC}"
docker-compose exec -T app php artisan migrate --force

# Generar key de Laravel si no existe
echo -e "${YELLOW}🔑 Generando APP_KEY de Laravel...${NC}"
docker-compose exec -T app php artisan key:generate --force

# Optimizar Laravel solo si está en producción
if grep -q "APP_ENV=production" ./agricol_patacon/.env; then
    echo -e "${YELLOW}⚡ Optimizando Laravel para producción...${NC}"
    docker-compose exec -T app php artisan config:cache
    docker-compose exec -T app php artisan route:cache
    docker-compose exec -T app php artisan view:cache
else
    echo -e "${YELLOW}ℹ️  Modo desarrollo detectado, omitiendo optimizaciones${NC}"
fi

# Instalar dependencias de Node si es necesario
if [ ! -d "./api/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias de Node.js...${NC}"
    docker-compose exec -T nodeapi npm install --production
fi

# Verificar estado de los servicios
echo -e "\n${YELLOW}🔍 Estado de los servicios:${NC}"
docker-compose ps

# Mostrar logs recientes
echo -e "\n${YELLOW}📋 Logs recientes:${NC}"
docker-compose logs --tail=20

echo -e "\n${GREEN}✅ ¡Inicialización completada!${NC}"
echo -e "\n📝 Servicios disponibles:"
echo -e "  - Laravel: ${GREEN}http://localhost${NC}"
echo -e "  - Node API: ${GREEN}http://api.localhost${NC} o ${GREEN}http://localhost:3105${NC}"
echo -e "  - phpMyAdmin: ${GREEN}http://localhost:8081${NC}"
echo -e "  - Redis: ${GREEN}localhost:6379${NC}"
echo -e "\n💡 Comandos útiles:"
echo -e "  - Ver logs: ${GREEN}docker-compose logs -f [servicio]${NC}"
echo -e "  - Reiniciar: ${GREEN}docker-compose restart [servicio]${NC}"
echo -e "  - Detener: ${GREEN}docker-compose down${NC}"
echo -e "  - Estado: ${GREEN}docker-compose ps${NC}"
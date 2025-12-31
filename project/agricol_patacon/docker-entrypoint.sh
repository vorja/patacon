#!/bin/bash
set -e

echo "🚀 Iniciando Laravel..."

# Esperar a que MySQL esté disponible
echo "⏳ Esperando MySQL..."
until php artisan db:show 2>/dev/null; do
    echo "⏳ MySQL no está listo, esperando..."
    sleep 2
done

echo "✅ MySQL está listo"

# Ejecutar migraciones
echo "📦 Ejecutando migraciones..."
php artisan migrate --force

# Limpiar caché
echo "🧹 Limpiando caché..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Optimizar para producción
if [ "$APP_ENV" = "production" ]; then
    echo "⚡ Optimizando para producción..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

echo "✅ Laravel iniciado correctamente"

# Ejecutar PHP-FPM
exec php-fpm
FROM php:8.3-fpm-alpine

# Instalar dependencias básicas
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    icu-dev \
    oniguruma-dev \
    mysql-client \
    bash

# Instalar extensiones de PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

# Instalar Redis
RUN apk add --no-cache pcre-dev $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del pcre-dev $PHPIZE_DEPS

# Configuración de PHP
RUN echo 'memory_limit=512M' > /usr/local/etc/php/conf.d/custom.ini && \
    echo 'upload_max_filesize=100M' >> /usr/local/etc/php/conf.d/custom.ini && \
    echo 'post_max_size=100M' >> /usr/local/etc/php/conf.d/custom.ini

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copiar archivos
COPY --chown=www-data:www-data . .

# Crear directorios necesarios
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# Instalar dependencias
RUN composer install --no-dev --optimize-autoloader --no-interaction

USER www-data

EXPOSE 9000

CMD ["php-fpm"]
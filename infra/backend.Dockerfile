FROM php:8.4-cli-alpine

RUN apk add --no-cache \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    icu-dev \
    oniguruma-dev \
 && docker-php-ext-install pdo pdo_pgsql pgsql zip intl bcmath opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

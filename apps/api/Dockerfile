FROM dunglas/frankenphp:php8.2



RUN install-php-extensions \
    pcntl \
    pdo_pgsql \
    gd \
    intl \
    zip \
    opcache

# Set working directory
WORKDIR /app

# Copy composer files
COPY composer.json composer.lock ./

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install dependencies
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Copy app files
COPY . .

# Run composer scripts (needs artisan)
RUN composer dump-autoload --optimize

# Permissions
RUN chmod -R 777 storage bootstrap/cache

# Start FrankenPHP
# Start FrankenPHP with dynamic port, forced HTTP, and IPv4 binding
CMD ["sh", "-c", "export SERVER_NAME=http://0.0.0.0:${PORT:-80} && frankenphp php-server"]

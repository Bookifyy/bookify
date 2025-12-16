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
# Hardcode port 8000 using ENV (more robust than CMD export)
ENV SERVER_NAME=http://0.0.0.0:8000

# Start FrankenPHP
CMD ["frankenphp", "php-server"]

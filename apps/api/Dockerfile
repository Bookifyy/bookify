FROM dunglas/frankenphp:php8.2



RUN install-php-extensions \
    pcntl \
    pdo_pgsql \
    pdo_mysql \
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
# Run migrations and seeds, then start server (ensures roles exist)
# Using '|| true' to ensure server starts even if DB isn't ready immediately
CMD ["sh", "-c", "php artisan storage:link --force || true && chmod -R 777 storage bootstrap/cache && php artisan migrate --force || true && php artisan db:seed --force || true && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]

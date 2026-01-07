FROM dunglas/frankenphp:php8.2



RUN install-php-extensions \
    pcntl \
    pdo_pgsql \
    pdo_mysql \
    gd \
    intl \
    zip \
    opcache

# Set PHP configuration
ENV MAX_UPLOAD=100M
ENV PHP_INI_SCAN_DIR=:/usr/local/etc/php/conf.d
RUN echo "upload_max_filesize=$MAX_UPLOAD" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size=$MAX_UPLOAD" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit=256M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "max_execution_time=300" >> /usr/local/etc/php/conf.d/uploads.ini

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
CMD ["sh", "-c", "php artisan storage:link --force || true && chmod -R 777 storage bootstrap/cache && php artisan migrate --force || true && php artisan db:seed --force || true && frankenphp php-server --listen :${PORT:-8000}"]

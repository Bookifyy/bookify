FROM dunglas/frankenphp:php8.2

ENV SERVER_NAME=:80

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
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Copy app files
COPY . .

# Permissions
RUN chmod -R 777 storage bootstrap/cache

# Start FrankenPHP
CMD ["frankenphp", "php-server"]

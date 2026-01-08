export const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

export const resolveAssetUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) {
        return path.replace('http://', 'https://');
    }

    const baseUrl = getApiUrl();
    // Ensure the path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
};

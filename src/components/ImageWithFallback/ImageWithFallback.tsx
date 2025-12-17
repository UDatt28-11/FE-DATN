import React, { useState, useEffect, useRef } from 'react';

interface ImageWithFallbackProps {
    src: string;
    alt: string;
    fallbackSrc?: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    onLoad?: () => void;
}

// Default placeholder as SVG data URI (gray box with image icon)
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Cpath fill="%23999" d="M200 125l-50 50h100z M150 175l25-25 15 15 35-35 25 25v50H150z"/%3E%3C/svg%3E';

/**
 * Component hiển thị ảnh với fallback khi lỗi 404
 * Tự động thay thế bằng ảnh placeholder nếu src không tồn tại
 * Tối ưu performance với lazy loading và error handling
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
    src,
    alt,
    fallbackSrc = '/img/bg-img/1.jpg',
    className = '',
    style,
    onClick,
    onLoad,
}) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const errorCountRef = useRef(0);

    // Reset khi src thay đổi
    useEffect(() => {
        setImgSrc(src);
        setHasError(false);
        setIsLoading(true);
        errorCountRef.current = 0;
    }, [src]);

    const handleError = () => {
        errorCountRef.current++;
        
        if (errorCountRef.current === 1) {
            // First error: try fallbackSrc
            console.warn(`[ImageWithFallback] Failed to load: ${imgSrc}, trying fallback`);
            setImgSrc(fallbackSrc);
            setHasError(true);
            setIsLoading(false);
        } else if (errorCountRef.current === 2) {
            // Second error: use SVG placeholder
            console.warn(`[ImageWithFallback] Fallback also failed, using default placeholder`);
            setImgSrc(DEFAULT_PLACEHOLDER);
            setIsLoading(false);
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
        if (onLoad) {
            onLoad();
        }
    };

    return (
        <img
            ref={imgRef}
            src={imgSrc}
            alt={alt}
            className={`${className} ${isLoading ? 'img-loading' : ''} ${hasError ? 'img-placeholder' : ''}`}
            style={style}
            onError={handleError}
            onLoad={handleLoad}
            onClick={onClick}
            loading="lazy"
            decoding="async"
        />
    );
};

export default ImageWithFallback;

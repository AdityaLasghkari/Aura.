/**
 * CoverImage — centralised, error-safe cover art renderer.
 *
 * • Detects placeholder fallback URLs (placehold.co) and renders <DefaultCover> instead.
 * • Falls back to <DefaultCover> on any network / decode error.
 * • Accepts all the usual styling props (className, grayscale, hover scale…).
 */
import { useState } from 'react';
import DefaultCover from './DefaultCover';

// URLs that represent "no real cover" — just render DefaultCover
const PLACEHOLDER_PATTERNS = [
    'placehold.co',
    'placeholder.com',
    'via.placeholder',
    'dummyimage.com',
];

const isPlaceholder = (url) => {
    if (!url) return true;
    return PLACEHOLDER_PATTERNS.some((p) => url.includes(p));
};

/**
 * @param {string}  src          - The coverUrl from the DB
 * @param {string}  alt          - Alt text  (song title)
 * @param {string}  title        - Passed to DefaultCover
 * @param {string}  artist       - Passed to DefaultCover
 * @param {string}  genre        - Passed to DefaultCover
 * @param {string}  imgClassName - Classes applied to the <img> element
 * @param {string}  className    - Classes applied to the wrapper <div>
 * @param {boolean} grayscale    - Whether to apply grayscale filter
 * @param {object}  imgRef       - Optional ref for the <img>
 */
const CoverImage = ({
    src,
    alt = '',
    title,
    artist,
    genre,
    imgClassName = 'w-full h-full object-cover',
    className = 'w-full h-full',
    grayscale = false,
    imgRef,
}) => {
    const [errored, setErrored] = useState(false);

    const showDefault = isPlaceholder(src) || errored;

    if (showDefault) {
        return (
            <div className={className}>
                <DefaultCover title={title || alt} artist={artist} genre={genre} />
            </div>
        );
    }

    return (
        <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={`${imgClassName} ${grayscale ? 'grayscale' : ''}`}
            loading="lazy"
            decoding="async"
            onError={() => setErrored(true)}
        />
    );
};

export default CoverImage;

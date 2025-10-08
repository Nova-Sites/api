import { ENV } from '@/lib/env';
import type { Request } from 'express';

const CLOUDINARY_HOST_MARKERS = [
	'res.cloudinary.com/',
	'cloudinary.com/',
];

function isPlainObject(input: any): boolean {
	if (input === null || typeof input !== 'object') return false;
	return Object.prototype.toString.call(input) === '[object Object]';
}

export interface OptimizeOptions {
	width?: number;
	height?: number;
	quality?: string | number; // e.g. 'auto' | 'auto:good' | 60
	fetchFormat?: 'auto' | 'webp' | 'avif';
	crop?: 'limit' | 'fit' | 'fill' | 'scale';
}

const DEFAULT_OPTIONS: OptimizeOptions = (() => {
	const width = Number(ENV.IMAGE_OPTIMIZE_DEFAULT_W || 0) || 800;
	const heightVal = Number(ENV.IMAGE_OPTIMIZE_DEFAULT_H || 0) || 0;
	return {
		quality: 'auto',
		fetchFormat: 'auto',
		crop: 'limit',
		width,
		...(heightVal > 0 ? { height: heightVal } : {}),
	};
})();

export function isCloudinaryUrl(url: string): boolean {
	if (!url || typeof url !== 'string') return false;
	return CLOUDINARY_HOST_MARKERS.some(marker => url.includes(marker)) && url.includes('/upload/');
}

export function getOptimizedCloudinaryUrl(inputUrl: string, options: OptimizeOptions = {}): string {
	try {
		if (!isCloudinaryUrl(inputUrl)) return inputUrl;

		const url = new URL(inputUrl);
		const parts = url.pathname.split('/');
		// Cloudinary path format: /<vX optional>/image/upload/<transform?>/<folder/...>/<file>
		const uploadIndex = parts.findIndex(p => p === 'upload');
		if (uploadIndex === -1) return inputUrl;

		const finalOptions: OptimizeOptions = {
			...DEFAULT_OPTIONS,
			...options,
		};

		const transformations: string[] = [];
		if (finalOptions.fetchFormat) transformations.push(`f_${finalOptions.fetchFormat}`);
		if (finalOptions.quality !== undefined) transformations.push(`q_${finalOptions.quality}`);
		if (finalOptions.width) transformations.push(`w_${Math.max(1, Math.floor(finalOptions.width))}`);
		if (finalOptions.height) transformations.push(`h_${Math.max(1, Math.floor(finalOptions.height))}`);
		if (finalOptions.crop) transformations.push(`c_${finalOptions.crop}`);

		// If there is already transformation segment after upload, merge politely
		const afterUpload = parts[uploadIndex + 1];
		if (afterUpload && afterUpload.includes(',')) {
			// Merge: prepend our transformations if not present
			const existing = new Set(afterUpload.split(','));
			for (const t of transformations) existing.add(t);
			parts[uploadIndex + 1] = Array.from(existing).join(',');
		} else {
			// Insert our transformation segment
			parts.splice(uploadIndex + 1, 0, transformations.join(','));
		}

		url.pathname = parts.join('/');
		return url.toString();
	} catch {
		return inputUrl;
	}
}

export function deriveOptimizeOptionsFromRequest(req?: Request): OptimizeOptions {
	const opts: OptimizeOptions = {};
	try {
		if (!req) return opts;
		// Client hints
		const viewportWidth = Number(req.get('Viewport-Width')) || Number(req.query['vw']);
		const width = Number(req.get('Width')) || Number(req.query['w']) || viewportWidth;
		if (width && width > 0) {
			opts.width = Math.min(width, Number(ENV.IMAGE_OPTIMIZE_MAX_W || 1600));
		}
		const height = Number(req.query['h']);
		if (height && height > 0) {
			opts.height = Math.min(height, Number(ENV.IMAGE_OPTIMIZE_MAX_H || 1200));
		}
		const q = req.query['q'];
		if (typeof q === 'string' && q.length > 0) {
			opts.quality = q;
		}
		return opts;
	} catch {
		return opts;
	}
}

export function deepOptimizeImageUrls(value: any, req?: Request, options?: OptimizeOptions, visited = new WeakSet()): any {
	if (value === null || value === undefined) return value;
	if (typeof value === 'string') {
		return getOptimizedCloudinaryUrl(value, { ...deriveOptimizeOptionsFromRequest(req), ...options });
	}
	if (typeof value !== 'object') return value;

	// Normalize Sequelize instances or objects providing toJSON() to plain objects to avoid circular refs
	if (typeof (value as any).toJSON === 'function') {
		try {
			value = (value as any).toJSON();
		} catch {
			// ignore and proceed with original value
		}
	}

	// If after toJSON value becomes primitive, return early
	if (value === null || typeof value !== 'object') return value;

	// Avoid invalid WeakSet values
	try {
		if (visited.has(value as object)) return value;
		visited.add(value as object);
	} catch {
		// If cannot be tracked in WeakSet (shouldn't happen for objects), skip tracking
	}

	if (Array.isArray(value)) {
		return value.map(v => deepOptimizeImageUrls(v, req, options, visited));
	}

	const result: any = Array.isArray(value) ? [] : {};
	for (const key of Object.keys(value)) {
		const current = (value as any)[key];
		if (typeof current === 'string') {
			result[key] = isCloudinaryUrl(current)
				? getOptimizedCloudinaryUrl(current, { ...deriveOptimizeOptionsFromRequest(req), ...options })
				: current;
		} else {
			// Only recurse into arrays or plain objects to reduce risk of circular structures
			if (Array.isArray(current) || isPlainObject(current) || typeof (current as any)?.toJSON === 'function') {
				result[key] = deepOptimizeImageUrls(current, req, options, visited);
			} else {
				result[key] = current;
			}
		}
	}
	return result;
}

export default {
	isCloudinaryUrl,
	getOptimizedCloudinaryUrl,
	deriveOptimizeOptionsFromRequest,
	deepOptimizeImageUrls,
};



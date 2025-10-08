import { Request, Response, NextFunction } from 'express';
import { deepOptimizeImageUrls, deriveOptimizeOptionsFromRequest, isCloudinaryUrl } from '@/utils/imageOptimizer';
import { ENV } from '@/lib';

/**
 * Middleware tối ưu URL ảnh Cloudinary trong toàn bộ JSON response.
 * - Tự động thêm f_auto, q_auto và scale theo thiết bị (Client Hints/qs)
 * - Có thể bật/tắt và giới hạn qua biến môi trường
 */
export function imageOptimizeMiddleware(req: Request, res: Response, next: NextFunction) {
    if (ENV.IMAGE_OPTIMIZE_ENABLED === 'false') {
        return next();
    }

	const originalJson = res.json.bind(res);
    const jsonOverride = (body?: any): Response => {
		try {
			if (!body) return originalJson(body);
            const collectCloudinaryUrls = (val: any, acc: string[] = [], max = 5, visited = new WeakSet()): string[] => {
                if (acc.length >= max || val === null || val === undefined) return acc;
                if (typeof val === 'string') {
                    if (isCloudinaryUrl(val) && acc.length < max) acc.push(val);
                    return acc;
                }
                if (typeof val !== 'object') return acc;
                if (visited.has(val as object)) return acc;
                visited.add(val as object);
                if (Array.isArray(val)) {
                    for (const v of val) {
                        collectCloudinaryUrls(v, acc, max, visited);
                        if (acc.length >= max) break;
                    }
                    return acc;
                }
                for (const k of Object.keys(val)) {
                    collectCloudinaryUrls(val[k], acc, max, visited);
                    if (acc.length >= max) break;
                }
                return acc;
            };

            
			// Không tối ưu nếu controller đã định dạng { success, message, data }
			const unwrapData = (payload: any) => {
				if (payload && typeof payload === 'object' && 'data' in payload && 'success' in payload) {
					return { ...payload, data: deepOptimizeImageUrls(payload.data, req, deriveOptimizeOptionsFromRequest(req)) };
				}
				return deepOptimizeImageUrls(payload, req, deriveOptimizeOptionsFromRequest(req));
			};

            const optimized = unwrapData(body);
			return originalJson(optimized);
		} catch (_err) {
			return originalJson(body);
		}
	};
	(res as any).json = jsonOverride;

	return next();
}

export default imageOptimizeMiddleware;



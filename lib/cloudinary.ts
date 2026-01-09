import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
    public_id: string;
    secure_url: string;
    format: string;
    bytes: number;
    version: number;
}

export async function uploadFile(
    fileBuffer: Buffer,
    folder: string = 'u2-dms'
): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result) {
                        resolve({
                            public_id: result.public_id,
                            secure_url: result.secure_url,
                            format: result.format,
                            bytes: result.bytes,
                            version: result.version,
                        });
                    }
                }
            )
            .end(fileBuffer);
    });
}

export async function deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
}

export async function getFileVersions(publicId: string) {
    try {
        const result = await cloudinary.api.resource(publicId, {
            versions: true,
        });
        return result.versions || [];
    } catch {
        return [];
    }
}

export { cloudinary };

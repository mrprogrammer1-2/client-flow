import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type DeleteFromCloudinaryInput = {
  publicId: string;
  resourceType: "image" | "video" | "raw";
};

export async function deleteFromCloudinary({
  publicId,
  resourceType,
}: DeleteFromCloudinaryInput) {
  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("Cloudinary file deletion failed.");
  }

  return result;
}

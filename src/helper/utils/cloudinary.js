import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { sendResponse } from "./sendResponse.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // Handle error cleanup without response
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

const deleteOnCloudinary = async (res, fileUrl, resourceType = "image") => {
  if (!fileUrl) {
    return sendResponse(
      res,
      false,
      null,
      "Public ID is missing for deletion",
      400
    );
  }

  try {
    const publicIdMatch = fileUrl.match(/\/([^/]+)\.[a-z]+$/);
    if (!publicIdMatch || publicIdMatch.length < 2) {
      return sendResponse(res, false, null, "Invalid Cloudinary file URL", 400);
    }

    const publicId = publicIdMatch[1];
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (response.result !== "ok") {
      return sendResponse(
        res,
        false,
        null,
        `Error while deleting the ${resourceType} on Cloudinary: ${response.result}`,
        400
      );
    }

    return response;
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error);
    return sendResponse(
      res,
      false,
      null,
      `Failed to delete ${resourceType} on Cloudinary`,
      500
    );
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };

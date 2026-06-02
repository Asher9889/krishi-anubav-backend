import UploadController from "./upload.controller";
import UploadService from "./upload.service";

const uploadService = new UploadService();
const uploadController = new UploadController(uploadService);

export { uploadController, uploadService };
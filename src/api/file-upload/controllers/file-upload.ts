import { factories } from '@strapi/strapi'
import { Context } from "koa";

export default factories.createCoreController('api::file-upload.file-upload', ({ strapi }) => ({
  async uploadFile(ctx: Context) {
    try {
      const id = Number(ctx.params.id);
      const files = ctx.request.files.files;
      console.log("🚀 ~ uploadFile ~ files:", files);
      
      if (!files) {
        return ctx.badRequest("No file to Upload");
      }

      const device = await strapi.entityService.findOne("api::device.device", id);
      console.log("Device found:", device);

      if (!device) {
        return ctx.notFound("Device not Found");
      }


      console.log("device.folderId",device.folderId);

      const uploadedFiles = await strapi.plugin("upload").service("upload").upload({
        data: {
          fileInfo:{
            folder:device.folderId
          }
        },
        files: Array.isArray(files) ? files : [files], 
      });

     
      const fileIds = uploadedFiles.map((file) => file.id);

      const newFileUpload = await strapi.entityService.create("api::file-upload.file-upload", {
        data: {
          name: uploadedFiles[0].name,
          file: fileIds, 
          device: id, 
          publishedAt: new Date() 
        }
      });

      return ctx.send({
        message: "File uploaded and linked successfully",
        files: uploadedFiles,
        fileUpload: newFileUpload
      });

    } catch (error) {
      console.error("Error uploading file:", error);
      ctx.throw(500, `Error uploading file: ${error.message}`);
    }
  }
}));
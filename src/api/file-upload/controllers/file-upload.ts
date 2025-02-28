import { factories } from '@strapi/strapi'
import { Context } from "koa";
import bcrypt from "bcrypt";

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
  },

  async getFiles(ctx:Context){
    try{
      const id =Number(ctx.params.id);
      console.log("Full request:", ctx.request);
      const password = ctx.query.password as string;

      console.log("Device id:",id);
      console.log("device password:",password);
      const device = await strapi.entityService.findOne("api::device.device", id);
     
      if(!device){
        return ctx.notFound("Device not Found");
      }
       console.log("Device found:", device);

      const isMatch = await bcrypt.compare(password,device.password);

      if(!isMatch){
        return ctx.unauthorized("Incorrect Password");
      }

      const allUploadedFiles = await strapi.plugin("upload").service("upload").findMany({
        filters: {
          folder: device.folderId, 
        },
      });
      console.log(allUploadedFiles);

      return ctx.send({ files: allUploadedFiles });

    }catch(error){
      console.error("Error Getting Files:",error);
      ctx.throw(500,`Error Gettin Files:${error.message}`);
    }
  },

  async deleteFile(ctx:Context){
    try{
      const {fileId} = ctx.params;

      const fileUploadEntry = await strapi.entityService.findMany("api::file-upload.file-upload", {
        filters: { file: fileId },
      });

      if (fileUploadEntry.length) {
        await strapi.entityService.delete("api::file-upload.file-upload", fileUploadEntry[0].id);
        console.log(fileUploadEntry);
      }

      const deletedFile = await strapi.plugin("upload").service("upload").remove({id:fileId})

      console.log(deletedFile);

      return ctx.send({ message: "File deleted successfully" });

    }catch(error){
      console.error("Error Deleting file:",error);
      ctx.throw(500,`Error Deleting File${error.message}`);
    }
  }
}));
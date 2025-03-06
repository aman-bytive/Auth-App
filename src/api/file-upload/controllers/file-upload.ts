import { factories } from "@strapi/strapi";
import { Context } from "koa";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
interface StrapiFile {
  name?: string; 
  originalFilename?: string;
}

export default factories.createCoreController(
  "api::file-upload.file-upload",
  ({ strapi }) => ({
    async uploadFile(ctx: Context) {
      try {
        const id = Number(ctx.params.id);
        const files = ctx.request.files.files;

        // get the uploaded fileName from user
        const uploadedFilesForName: StrapiFile[] = Array.isArray(files)
          ? files
          : [files];

        const filetodelete = uploadedFilesForName[0].originalFilename;

        console.log("filetodelete", filetodelete);

        if (!files) {
          return ctx.badRequest("No file to Upload");
        }

        const device = await strapi.entityService.findOne(
          "api::device.device",
          id
        );
        console.log("Device found:", device);

        if (!device) {
          return ctx.notFound("Device not Found");
        }

        //get all the uploaded files for that device
        const allUploadedFiles = await strapi
          .plugin("upload")
          .service("upload")
          .findMany({
            filters: {
              folder: device.folderId,
            },
          });

        console.log("allUploadedFiles=====>", allUploadedFiles);

        //check for the same fileName in previously uploaded file
        const fileToDeleteEntry = allUploadedFiles.find(
          (file) => file.name === filetodelete
        );

        if (fileToDeleteEntry) {

          //if same file is found then delete the previous file from everywhere
          console.log("File ID to delete:", fileToDeleteEntry.id);

          const fileUploadEntry = await strapi.entityService.findMany(
            "api::file-upload.file-upload",
            {
              filters: { file: fileToDeleteEntry.id },
            }
          );

          if (fileUploadEntry.length) {
            await strapi.entityService.delete(
              "api::file-upload.file-upload",
              fileUploadEntry[0].id
            );
            console.log(fileUploadEntry);
          }

          const deletedFile = await strapi
            .plugin("upload")
            .service("upload")
            .remove({ id: fileToDeleteEntry.id });

        } else {
          //if no fileName matches with previously uploaded file
          console.log("File not found.");
        }

        console.log("device.folderId", device.folderId);

        const uploadedFiles = await strapi
          .plugin("upload")
          .service("upload")
          .upload({
            data: {
              fileInfo: {
                folder: device.folderId, //virtual folder in strapi
              },
            },
            files: Array.isArray(files) ? files : [files],
          });

        const publicDir: string = strapi.dirs.static.public;
        const deviceFolderPath = path.join(
          publicDir,
          "uploads",
          `${device.deviceId}`
        );

        uploadedFiles.forEach((file) => {
          const oldPath = path.join(publicDir, "uploads", file.hash + file.ext);
          const newPath = path.join(deviceFolderPath, file.name);

          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
            console.log(`File moved to: ${newPath}`);
          } else {
            console.log(`File not Found: ${oldPath}`);
          }
        });

        const fileIds = uploadedFiles.map((file) => file.id);

        const newFileUpload = await strapi.entityService.create(
          "api::file-upload.file-upload",
          {
            data: {
              name: uploadedFiles[0].name,
              file: fileIds,
              device: id,
              publishedAt: new Date(),
            },
          }
        );

        return ctx.send({
          message: "File uploaded and linked successfully",
          files: uploadedFiles,
          fileUpload: newFileUpload,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        ctx.throw(500, `Error uploading file: ${error.message}`);
      }
    },

    async getFiles(ctx: Context) {
      try {
        const id = Number(ctx.params.id);
        console.log("Full request:", ctx.request);
        // const password = ctx.query.password as string;

        console.log("Device id:", id);
        // console.log("device password:",password);
        const device = await strapi.entityService.findOne(
          "api::device.device",
          id
        );

        if (!device) {
          return ctx.notFound("Device not Found");
        }
        console.log("Device found:", device);

        // const isMatch = await bcrypt.compare(password,device.password);

        // if(!isMatch){
        //   return ctx.unauthorized("Incorrect Password");
        // }

        const allUploadedFiles = await strapi
          .plugin("upload")
          .service("upload")
          .findMany({
            filters: {
              folder: device.folderId,
            },
          });

        const visibleFiles = allUploadedFiles.filter(
          (file) => !file.name.startsWith(".")
        );

        console.log(visibleFiles);

        return ctx.send({ files: visibleFiles });
      } catch (error) {
        console.error("Error Getting Files:", error);
        ctx.throw(500, `Error Gettin Files:${error.message}`);
      }
    },

    async deleteFile(ctx: Context) {
      try {
        const { id, fileId } = ctx.params;

        const device = await strapi.entityService.findOne(
          "api::device.device",
          id
        );

        if (!device) {
          return ctx.notFound("Device not found");
        }
        console.log("Device found:", device);

        const fileUploadEntry = await strapi.entityService.findMany(
          "api::file-upload.file-upload",
          {
            filters: { file: fileId },
          }
        );

        const publicDir: string = strapi.dirs.static.public;
        const deviceFolderPath = path.join(
          publicDir,
          "uploads",
          `${device.deviceId}`
        );
        const filePath = path.join(deviceFolderPath, fileUploadEntry[0].name);
        console.log(filePath);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`File deleted from disk: ${filePath}`);
        } else {
          console.warn(`File not found on disk: ${filePath}`);
          return ctx.notFound("File not found");
        }
        console.log(fileUploadEntry[0].name);

        if (fileUploadEntry.length) {
          await strapi.entityService.delete(
            "api::file-upload.file-upload",
            fileUploadEntry[0].id
          );
          console.log(fileUploadEntry);
        }

        const deletedFile = await strapi
          .plugin("upload")
          .service("upload")
          .remove({ id: fileId });

        console.log(deletedFile);

        return ctx.send({ message: "File deleted successfully" });
      } catch (error) {
        console.error("Error Deleting file:", error);
        ctx.throw(500, `Error Deleting File${error.message}`);
      }
    },
  })
);

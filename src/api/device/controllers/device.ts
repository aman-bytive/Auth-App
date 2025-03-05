/**
 * device controller
 */

import { factories } from "@strapi/strapi";
import { Context } from "koa";
import fs from "fs";
import path from "path";

export default factories.createCoreController(
  "api::device.device",
  ({ strapi }) => ({
    async create(ctx: Context) {
      try {
        const user = ctx.state.user;

        if (!user) {
          ctx.response.status = 401;
          ctx.response.body = { error: "Authentication required" };
          return;
        }

        const { deviceId, password, deviceName } = ctx.request.body;

        if (!deviceId || !password || !deviceName) {
          return ctx.badRequest(
            "Device ID, password, and device name are required"
          );
        }

        const existingDevices = await strapi.entityService.findMany(
          "api::device.device",
          {
            filters: { deviceId: deviceId },
          }
        );

        console.log(existingDevices);

        if (existingDevices.length) {
          return ctx.badRequest("This device is already registered in system");
        }

        const folderResponse = await strapi
          .plugin("upload")
          .service("folder")
          .create({
            name: `device-${deviceId}`,
            parent: null,
          });

        const publicDir: string = strapi.dirs.static.public;
        const deviceFolderPath = path.join(
          publicDir,
          "uploads",
          `device-${deviceId}`
        );

        if (!fs.existsSync(deviceFolderPath)) {
          fs.mkdirSync(deviceFolderPath, { recursive: true });
        }

        const newDevice = await strapi.entityService.create(
          "api::device.device",
          {
            data: {
              deviceId,
              password,
              deviceName,
              users_permissions_user: user.id,
              folderId: `${folderResponse.id}`,
            },
          }
        );

        console.log("New Device Created:", newDevice);
        ctx.send(newDevice, 201);
      } catch (error) {
        console.error("Error creating device:", error);
        ctx.throw(500, error);
      }
    },

    async findUserDevices(ctx: Context) {
      try {
        const user = ctx.state.user;

        if (!user) {
          ctx.response.status = 401;
          ctx.response.body = { error: "Authentication required" };
          return;
        }

        const devices = await strapi.entityService.findMany(
          "api::device.device",
          { filters: { users_permissions_user: user.id } }
        );

        ctx.send(devices);
      } catch (error) {
        ctx.throw(500, error);
      }
    },

    async delete(ctx: Context) {
      try {
        const user = ctx.state.user;

        if (!user) {
          ctx.response.status = 401;
          ctx.response.body = { error: "Authentication required" };
          return;
        }

        const id = Number(ctx.params.id);

        const devices = await strapi.entityService.findMany(
          "api::device.device",
          { filters: { users_permissions_user: user.id } }
        );

        const device = devices.find((device) => device.id === id);

        if (!device) {
          return ctx.forbidden(
            "You don't have permission to access this device"
          );
        }

        //delete the device folder that is in upload folder (CUSTOM FOLDER)
        const publicDir: string = strapi.dirs.static.public;
        const deviceFolderPath = path.join(
          publicDir,
          "uploads",
          `device-${device.deviceId}`
        );

        if (fs.existsSync(deviceFolderPath)) {
          fs.rmSync(deviceFolderPath, { recursive: true, force: true });
          console.log(`Deleted folder: ${deviceFolderPath}`);
        } else {
          console.error(`Folder not found: ${deviceFolderPath}`);
        }

        const fileUploads = await strapi.entityService.findMany(
          "api::file-upload.file-upload",
          {
            filters: { device: device },
          }
        );

        console.log(fileUploads);

        //delete from file upload collection
        for (const fileUpload of fileUploads) {
          await strapi.entityService.delete(
            "api::file-upload.file-upload",
            fileUpload.id
          );
        }

        await strapi
          .plugin("upload")
          .service("folder")
          .deleteByIds(Number(device.folderId));

        await strapi.entityService.delete("api::device.device", id);

        ctx.send({ message: "Device deleted successfully" });
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  })
);

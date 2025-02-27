/**
 * device controller
 */

import { factories } from "@strapi/strapi";
import { Context } from "koa";

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

        const { deviceId,password,deviceName } = ctx.request.body;

        if (!deviceId && !password && !deviceName) {
          return ctx.badRequest("Device name is required");
        }

        const folderResponse = await strapi
          .plugin("upload")
          .service("folder")
          .create({
            name: `device-${deviceId}`,
            parent: null,
          });

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

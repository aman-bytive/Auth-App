/**
 * device controller
 */

import { factories } from '@strapi/strapi'
import { Context } from "koa";

export default factories.createCoreController("api::device.device",({strapi})=>({
    async create(ctx: Context) {
        try {
            const user = ctx.state.user;
            console.log("Authenticated User:", user);
    
            if (!user) {
                ctx.response.status = 401;
                ctx.response.body = { error: "Authentication required" };
                return;
            }
    
            const { deviceId } = ctx.request.body;
    
            if (!deviceId) {
                return ctx.badRequest("Device name is required");
            }
    
            const folderResponse = await strapi.plugin("upload").service("folder").create({
                name: `device-${deviceId}`,
                parent: null,
            });
    

            const newDevice = await strapi.entityService.create("api::device.device", {
                data: {
                    deviceId,
                    users_permissions_user: user.id, 
                    folderId: `${folderResponse.id}`,
                },
            });
    
            console.log("New Device Created:", newDevice);
            ctx.send(newDevice, 201);
        } catch (error) {
            console.error("Error creating device:", error);
            ctx.throw(500, error);
        }
    }
    
}))

export default {
    routes: [
      {
        method: "POST",
        path: "/devices",
        handler: "device.create",
        config: { policies: ["global::isAuthenticated"] }
      },
      {
        method: "GET",
        path: "/devices",
        handler: "device.findUserDevices",
        config: { policies: ["global::isAuthenticated"] }
      },
      {
        method: "DELETE",
        path: "/devices/:id",
        handler: "device.delete",
        config: { policies: ["global::isAuthenticated"] }
      },
      {
        method: "GET",
        path: "/device/:id",
        handler: "device.findUniqueDevice",
        config: { policies: ["global::isAuthenticated"] }
      },
    ]
  };
  
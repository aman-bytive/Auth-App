export default {
    routes: [
      {
        method: "POST",
        path: "/devices",
        handler: "device.create",
        config: { policies: ["global::isAuthenticated"] }
      },
    ]
  };
  
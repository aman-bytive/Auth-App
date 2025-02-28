module.exports = {
    routes:[
      {
        method: "POST",
        path: "/devices/:id/upload",
        handler: "file-upload.uploadFile",
        config: {
          policies: ["global::isAuthenticated"],
          middlewares: [], 
        },
      },
      {
        method: "GET",
        path: "/devices/:id/files",
        handler: "file-upload.getFiles",
        config: {
          policies: ["global::isAuthenticated"], 
        },
      },
      {
        method: "DELETE",
        path: "/files/:fileId",
        handler: "file-upload.deleteFile",
        config: {
          policies: ["global::isAuthenticated"], 
        },
      },
    ]
  };
  
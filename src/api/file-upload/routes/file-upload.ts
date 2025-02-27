module.exports = {
    // routes: [
    //   // Upload file to a specific device
      
    //   // Get all uploaded files for a specific device
    //   {
    //     method: "GET",
    //     path: "/devices/:id/files",
    //     handler: "file-upload.getFiles",
    //     config: {
    //       policies: ["global::isAuthenticated"], // Ensures only authenticated users can access files
    //     },
    //   },
  
    //   // Delete a specific file from a device
    //   {
    //     method: "DELETE",
    //     path: "/devices/:deviceId/files/:fileId",
    //     handler: "file-upload.deleteFile",
    //     config: {
    //       policies: ["global::isAuthenticated"], // Ensures only authorized users can delete files
    //     },
    //   },
    // ],
    routes:[
      {
        method: "POST",
        path: "/devices/:id/upload",
        handler: "file-upload.uploadFile",
        config: {
          policies: ["global::isAuthenticated"], // Ensures only authenticated users can upload
          middlewares: [], // You can add middlewares like file validation if needed
        },
      },
    ]
  };
  
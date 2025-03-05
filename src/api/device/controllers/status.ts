import path from "path"
import fs from "fs"
export const getDeviceStatus = async (deviceId: string) => {
    try {
        // Construct the path to the `.status` file
        const publicDir: string = strapi.dirs.static.public;
        const deviceFolderPath = path.join(publicDir, "uploads", `device-${deviceId}`);
        const statusFilePath = path.join(deviceFolderPath, ".status");
    
        let status = "No connection";
        let version = "Unknown";
    
        // Check if the .status file exists
        if (fs.existsSync(statusFilePath)) {
          // Get the last modified time
          const fileStats = fs.statSync(statusFilePath);
          const lastModified = fileStats.mtime.toISOString(); // Last connection timestamp
    
          // Read file content to get version
          version = fs.readFileSync(statusFilePath, "utf8").trim();
    
          status = `Last connection: ${lastModified}`;
        }
    
        return { status, version };
      } catch (error) {
        console.error("Error fetching device status:", error);
        return { status: "Error", version: "Unknown" };
      }
  };
  
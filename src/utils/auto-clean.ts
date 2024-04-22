import fs from "fs";
import path from "path";

function maintainM4sFiles(directoryPath: string): void {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    // Filter out directories only
    const subDirectories = files.filter((file) =>
      fs.statSync(path.join(directoryPath, file)).isDirectory()
    );

    // Sort directories by creation time in descending order
    subDirectories.sort((a, b) => {
      return (
        fs.statSync(path.join(directoryPath, b)).ctime.getTime() -
        fs.statSync(path.join(directoryPath, a)).ctime.getTime()
      );
    });

    // Remove the last 5 directories from the list
    const directoriesToRemove = subDirectories.slice(5);

    // Delete the directories and their contents
    directoriesToRemove.forEach((directory) => {
      const directoryToRemove = path.join(directoryPath, directory);
      removeDirectoryRecursive(directoryToRemove);
    });

    // Process the last 5 directories
    const lastFiveDirectories = subDirectories.slice(0, 5);
    lastFiveDirectories.forEach((directory) => {
      const directoryToProcess = path.join(directoryPath, directory);
      processDirectory(directoryToProcess);
    });
  });
}

function removeDirectoryRecursive(directoryPath: string): void {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursive call for subdirectories
        removeDirectoryRecursive(curPath);
      } else {
        // Delete files
        fs.unlinkSync(curPath);
      }
    });
    // Delete the directory itself
    fs.rmdirSync(directoryPath);
    console.log("Deleted directory:", directoryPath);
  }
}

function processDirectory(directoryPath: string): void {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    // Filter out files with the extension '.m4s'
    const m4sFiles = files.filter((file) => path.extname(file) === ".m4s");

    // Sort files by modified time in ascending order
    m4sFiles.sort((a, b) => {
      return (
        fs.statSync(path.join(directoryPath, a)).mtime.getTime() -
        fs.statSync(path.join(directoryPath, b)).mtime.getTime()
      );
    });

    // Calculate number of files to delete
    const filesToDelete = Math.max(0, m4sFiles.length - 5);

    // Delete initial files
    for (let i = 0; i < filesToDelete; i++) {
      const fileToDelete = path.join(directoryPath, m4sFiles[i]);
      fs.unlink(fileToDelete, (err) => {
        if (err) {
          console.error("Error deleting file:", fileToDelete, err);
        } else {
          console.log("Deleted file:", fileToDelete);
        }
      });
    }
  });
}

// Example usage
setInterval(() => maintainM4sFiles("live"), 60 * 1000);

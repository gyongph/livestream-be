"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function maintainM4sFiles(directoryPath) {
    fs_1.default.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }
        // Filter out directories only
        const subDirectories = files.filter((file) => fs_1.default.statSync(path_1.default.join(directoryPath, file)).isDirectory());
        // Sort directories by creation time in descending order
        subDirectories.sort((a, b) => {
            return (fs_1.default.statSync(path_1.default.join(directoryPath, b)).ctime.getTime() -
                fs_1.default.statSync(path_1.default.join(directoryPath, a)).ctime.getTime());
        });
        // Remove the last 5 directories from the list
        const directoriesToRemove = subDirectories.slice(5);
        // Delete the directories and their contents
        directoriesToRemove.forEach((directory) => {
            const directoryToRemove = path_1.default.join(directoryPath, directory);
            removeDirectoryRecursive(directoryToRemove);
        });
        // Process the last 5 directories
        const lastFiveDirectories = subDirectories.slice(0, 5);
        lastFiveDirectories.forEach((directory) => {
            const directoryToProcess = path_1.default.join(directoryPath, directory);
            processDirectory(directoryToProcess);
        });
    });
}
function removeDirectoryRecursive(directoryPath) {
    if (fs_1.default.existsSync(directoryPath)) {
        fs_1.default.readdirSync(directoryPath).forEach((file) => {
            const curPath = path_1.default.join(directoryPath, file);
            if (fs_1.default.lstatSync(curPath).isDirectory()) {
                // Recursive call for subdirectories
                removeDirectoryRecursive(curPath);
            }
            else {
                // Delete files
                fs_1.default.unlinkSync(curPath);
            }
        });
        // Delete the directory itself
        fs_1.default.rmdirSync(directoryPath);
        console.log("Deleted directory:", directoryPath);
    }
}
function processDirectory(directoryPath) {
    fs_1.default.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }
        // Filter out files with the extension '.m4s'
        const m4sFiles = files.filter((file) => path_1.default.extname(file) === ".m4s");
        // Sort files by modified time in ascending order
        m4sFiles.sort((a, b) => {
            return (fs_1.default.statSync(path_1.default.join(directoryPath, a)).mtime.getTime() -
                fs_1.default.statSync(path_1.default.join(directoryPath, b)).mtime.getTime());
        });
        // Calculate number of files to delete
        const filesToDelete = Math.max(0, m4sFiles.length - 5);
        // Delete initial files
        for (let i = 0; i < filesToDelete; i++) {
            const fileToDelete = path_1.default.join(directoryPath, m4sFiles[i]);
            fs_1.default.unlink(fileToDelete, (err) => {
                if (err) {
                    console.error("Error deleting file:", fileToDelete, err);
                }
                else {
                    console.log("Deleted file:", fileToDelete);
                }
            });
        }
    });
}
// Example usage
setInterval(() => maintainM4sFiles("live"), 60 * 1000);

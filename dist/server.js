"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const node_https_1 = __importDefault(require("node:https"));
const ws_1 = __importDefault(require("ws"));
const node_fs_1 = __importDefault(require("node:fs"));
const storage_engine_1 = __importDefault(require("./modules/storage-engine"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
require("./utils/auto-clean");
// Set up Multer options
const upload = (0, multer_1.default)({ storage: storage_engine_1.default });
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3001",
        "https://livepush.io",
        "https://hlsjs.video-dev.org",
        "https://video-player-hls.vercel.app",
        "https://192.168.100.7:3001",
        "https://castr.com",
        "https://livestream-black.vercel.app",
    ],
}));
app.use(express_1.default.static("live"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.put("/upload/:guestID/:filename", (req, res) => {
    const { filename, guestID } = req.params;
    const writeStream = node_fs_1.default.createWriteStream(__dirname + `/live/${guestID}/${filename}`);
    // Handle incoming chunks of data
    req.on("data", (chunk) => {
        writeStream.write(chunk);
    });
    req.on("error", (err) => {
        writeStream.end();
    });
    req.on("close", () => {
        writeStream.end();
    });
    // Handle end of request
    req.on("end", () => {
        writeStream.end();
        res.send("Data received successfully");
    });
});
app.post("/live", upload.single("chunk"), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    // console.log(req.file);
    // fs.readFile(__dirname + "/live/master.m3u8", (err, data) => {
    //   console.log(req.query);
    //   const newData = `#EXTINF:${req.query.duration},\n${req?.file?.originalname}\n`;
    //   if (err) {
    //     console.error("Error reading file:", err);
    //     return;
    //   }
    //   // Append new data to the existing content
    //   const updatedData =
    //     data +
    //     //   .toString()
    //     //   .replace(
    //     //     /#EXT-X-MEDIA-SEQUENCE:\d+/,
    //     //     `#EXT-X-MEDIA-SEQUENCE:${
    //     //       parseInt(req.query.part) > 0
    //     //         ? parseInt(req.query.part) - 5 > 0
    //     //           ? parseInt(req.query.part) - 5
    //     //           : req.query.part
    //     //         : 1
    //     //     }`
    //     //   )
    //     newData;
    //   // Write the updated content back to the file
    //   fs.writeFile(
    //     __dirname + "/live/master.m3u8",
    //     updatedData,
    //     "utf8",
    //     (err) => {
    //       if (err) {
    //         console.error("Error appending data to file:", err);
    //         return;
    //       }
    //       console.log("Data appended successfully!");
    //     }
    //   );
    // });
    res.sendStatus(200);
});
const ErrorHandler = (err, req, res, next) => {
    if (err) {
        res.status(500).send(err);
    }
    else
        next();
};
app.get("/", (req, res) => res.send("Hellow world"));
app.use(ErrorHandler);
app.listen(3000, "0.0.0.0", () => console.log("listening on port 3000"));
const options = {
    key: node_fs_1.default.readFileSync("certs/key.pem"),
    cert: node_fs_1.default.readFileSync("certs/cert.pem"),
};
const server = node_https_1.default.createServer(options, app).listen(4343);
const wss = new ws_1.default.Server({ server });
wss.on("connection", (socket, request) => {
    // const liveStream = CreateLiveStream()
    socket.on("message", (data) => console.log(data.toString("utf-8")));
});

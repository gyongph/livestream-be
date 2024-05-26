import dotenv from "dotenv";
dotenv.config();
import { Writable, PassThrough } from "node:stream";
import express, { ErrorRequestHandler } from "express";
import multer from "multer";
import http from "node:http";
import WebSocket from "ws";
import cors from "cors";
import CustomStorage from "./modules/livestream/storage-engine";
import bodyParser from "body-parser";
import allowedOrigin from "./config/allowed-origin.json";
const app = express();

import "./utils/auto-clean";
import customCorsMiddleware from "./middleware/custom-cors";
import { createPreSignedURL, transferToS3Bucket } from "./modules/s3-storage";
// Set up Multer options
const upload = multer({ storage: CustomStorage });
app.use(
  cors({
    origin: ["https://livepush.io"],
  })
);
app.use(customCorsMiddleware(allowedOrigin));
app.use(express.static("live"));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.get(`/live/:guestID/:filename`, async (req, res, next) => {
  const { filename, guestID } = req.params;
  const presignedUrl = await createPreSignedURL(
    `live/${guestID}/${filename}`,
    filename.match(".m3u8") ? 60 * 60 * 24 : undefined
  );
  res.redirect(presignedUrl);
});
app.put("/upload/:guestID/:filename", (req, res) => {
  const { filename, guestID } = req.params;
  const writeStream = new PassThrough();
  transferToS3Bucket(`live/${guestID}/${filename}`, writeStream);

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

const ErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err) {
    res.status(500).send(err);
  } else next();
};

app.get("/", (req, res) => res.send("Hellow world"));
app.use(ErrorHandler);
const server = http.createServer(app).listen(5001, "0.0.0.0", () => {
  console.log(`listening on port 5001`);
});
const wss = new WebSocket.Server({ server });
wss.on("connection", (socket, request) => {
  // const liveStream = CreateLiveStream()
  socket.on("message", (data) => {});
});

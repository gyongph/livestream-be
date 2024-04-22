"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushToLive = exports.CreateLiveStream = void 0;
const node_child_process_1 = require("node:child_process");
const node_fs_1 = __importDefault(require("node:fs"));
const create_hls_config_1 = __importDefault(require("./utils/create-hls-config"));
const ActiveLiveStream = new Map();
// Check if a chunk of data is UTF-8 encoded
function isUTF8(data) {
    // Convert the chunk to a Buffer
    const buffer = Buffer.from(data);
    // Check if the buffer is valid UTF-8
    return buffer.toString("utf8") === data;
}
// Example usage
const chunk = "Chunk of data"; // Example chunk
console.log(isUTF8(chunk)); // Output: true
const CreateLiveStream = (guestID) => {
    let headTag = null;
    let writableStream;
    let segmentCount = 0;
    node_fs_1.default.mkdirSync(`live/${guestID}`, {
        recursive: true,
    });
    const ffmpegProcess = (0, node_child_process_1.spawn)("ffmpeg", (0, create_hls_config_1.default)(guestID));
    ffmpegProcess.stderr.on("data", (error) => {
        console.log(`${guestID}`, error.toString("utf-8"));
    });
    ffmpegProcess.stdout.on("data", (error) => {
        // console.log(parseTransportStreamHeader(error));
        // const tag: string = error.slice(0, 7).toString("utf-8");
        // console.log(tag.match("G@"));
        // if (!headTag) {
        //   console.log("Starting encoding");
        //   headTag = "G@";
        //   writableStream = fs.createWriteStream(`live/test/part${segmentCount}.ts`);
        // } else if (tag === "#EXTM3U" && headTag !== "#EXTM3U") {
        //   console.log("segment encoded, updating playlist");
        //   headTag = "#EXTM3U";
        //   writableStream.end();
        //   segmentCount++;
        //   writableStream = fs.createWriteStream("live/test/master.m3u8");
        // } else if (tag.match("G@") && headTag === "#EXTM3U") {
        //   console.log("paylist updated, encoding new segment");
        //   headTag = "G@";
        //   writableStream.end();
        //   writableStream = fs.createWriteStream(`live/test/part${segmentCount}.ts`);
        // } else if (headTag === "G@" && tag.match("G@")) {
        //   console.log("new segment added");
        //   writableStream.end();
        //   segmentCount++;
        //   writableStream = fs.createWriteStream(`live/test/part${segmentCount}.ts`);
        // }
        // writableStream.write(error);
    });
    ffmpegProcess.stdin.on("close", () => {
        console.log(`${guestID} stream closed`);
    });
    ffmpegProcess.stdin.on("error", function () {
        writableStream && writableStream.end();
    });
    return ffmpegProcess.stdin;
};
exports.CreateLiveStream = CreateLiveStream;
const PushToLive = (guestID, file) => {
    const { stream, timeoutID } = ActiveLiveStream.get(guestID) || {};
    if (!stream) {
        const liveStream = (0, exports.CreateLiveStream)(guestID);
        file.stream.on("data", (chunk) => {
            liveStream.write(chunk);
        });
        ActiveLiveStream.set(guestID, {
            stream: liveStream,
            timeoutID: setTimeout(() => {
                liveStream.end();
                ActiveLiveStream.delete(guestID);
            }, 1 * 60 * 1000),
        });
    }
    else {
        console.log("created");
        clearTimeout(timeoutID);
        ActiveLiveStream.set(guestID, {
            stream,
            timeoutID: setTimeout(() => {
                stream.end();
                ActiveLiveStream.delete(guestID);
            }, 1 * 60 * 1000),
        });
        file.stream.on("data", (chunk) => {
            stream.write(chunk);
        });
    }
};
exports.PushToLive = PushToLive;
function parseTransportStreamHeader(packet) {
    const header = {
        sync_byte: (packet[0] & 0xff000000) >> 24,
        transport_error_indicator: (packet[0] & 0x800000) >> 23,
        payload_unit_start_indicator: (packet[0] & 0x400000) >> 22,
        transport_priority: (packet[0] & 0x200000) >> 21,
        pid: (packet[0] & 0x1fff00) >> 8,
        transport_scrambling_control: (packet[0] & 0xc0) >> 6,
        adaptation_field_control: (packet[0] & 0x30) >> 4,
        continuity_counter: packet[0] & 0xf,
    };
    const adaptationFieldControl = header.adaptation_field_control;
    if (adaptationFieldControl === 0b10 || adaptationFieldControl === 0b11) {
        const adaptationFieldLength = packet[4]; // Assuming adaptation field starts at byte 4
        const adaptationField = parseAdaptationField(packet.slice(4));
        header.adaptation_field = adaptationField;
        // Payload data starts after adaptation field
        header.payload_data = packet.slice(4 + adaptationFieldLength);
    }
    else if (adaptationFieldControl === 0b01) {
        // Payload data starts immediately after the header
        header.payload_data = packet.slice(4);
    }
    return header;
}
function parseAdaptationField(adaptationFieldBytes) {
    const adaptationField = {
        adaptation_field_length: adaptationFieldBytes[0],
        discontinuity_indicator: (adaptationFieldBytes[1] & 0x80) >> 7,
        random_access_indicator: (adaptationFieldBytes[1] & 0x40) >> 6,
        elementary_stream_priority_indicator: (adaptationFieldBytes[1] & 0x20) >> 5,
        PCR_flag: (adaptationFieldBytes[1] & 0x10) >> 4,
        OPCR_flag: (adaptationFieldBytes[1] & 0x08) >> 3,
        splicing_point_flag: (adaptationFieldBytes[1] & 0x04) >> 2,
        transport_private_data_flag: (adaptationFieldBytes[1] & 0x02) >> 1,
        adaptation_extension_flag: adaptationFieldBytes[1] & 0x01,
    };
    // Parse optional fields if present
    if (adaptationField.PCR_flag) {
        adaptationField.PCR = parsePCR(adaptationFieldBytes.slice(2));
    }
    if (adaptationField.OPCR_flag) {
        adaptationField.OPCR = parsePCR(adaptationFieldBytes.slice(2 + 6));
    }
    // Parse other optional fields if needed
    return adaptationField;
}
function parsePCR(pcrBytes) {
    const base = (pcrBytes[0] << 25) |
        (pcrBytes[1] << 17) |
        (pcrBytes[2] << 9) |
        (pcrBytes[3] << 1) |
        ((pcrBytes[4] & 0x80) >> 7);
    const extension = ((pcrBytes[4] & 0x01) << 8) | pcrBytes[5];
    return { base, extension };
}

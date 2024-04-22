"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const livestream_1 = require("../livestream");
const CustomStorage = {
    _handleFile(req, file, cb) {
        try {
            if (!req.query.guestID)
                throw new Error('guest id is required');
            const guestID = req.query.guestID;
            (0, livestream_1.PushToLive)(guestID, file);
            cb(null, file);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Encountered an error!";
            cb(message);
        }
    },
    _removeFile() { },
};
exports.default = CustomStorage;

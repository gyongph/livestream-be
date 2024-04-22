import { StorageEngine } from "multer";
import { PushToLive } from "../livestream";

const CustomStorage: StorageEngine = {
  _handleFile(req, file, cb) {
    if (!req.query.guestID) return;
    const guestID = req.query.guestID as string;
    PushToLive(guestID, file);
    cb(null, file);
  },
  _removeFile() {},
};

export default CustomStorage;
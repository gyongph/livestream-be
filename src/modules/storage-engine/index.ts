import { StorageEngine } from "multer";
import { PushToLive } from "../livestream";

const CustomStorage: StorageEngine = {
  _handleFile(req, file, cb) {
    try {
      if (!req.query.guestID) throw new Error('guest id is required');
      const guestID = req.query.guestID as string;
      PushToLive(guestID, file);
      cb(null, file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Encountered an error!"
      cb(message);
    }
  },
  _removeFile() {},
};

export default CustomStorage;

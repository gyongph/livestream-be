import {
  PutObjectCommand,
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { PassThrough } from "node:stream";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const s3Client = new S3Client();

export const transferToS3Bucket = async (Key: string, stream: PassThrough) => {
  //   const stream = new PassThrough();
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: "livestream-gyong-ph",
      ACL: "private",
      Key,
      Expires: new Date(new Date().getTime() + 1000 * 60 * 3),
      Body: stream,
    },
  });

  upload.on("httpUploadProgress", (progress) => {
    console.log(progress);
  });

  await upload.done();
};

export const createPreSignedURL = async (
  Key: string,
  expiresIn: number | undefined = 30
) => {
  const command = new GetObjectCommand({
    Key,
    Bucket: "livestream-gyong-ph",
  });
  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: expiresIn,
  });
  return signedUrl;
};

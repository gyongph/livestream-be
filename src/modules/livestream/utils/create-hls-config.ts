const CreateLiveHLSConfig = function (guestID: string) {
  return [
    "-i",
    "-",
    "-c:v",
    "copy",
    "-c:a",
    "mp3",
    "-f",
    "hls",
    "-hls_time",
    "5",
    "-loglevel",
    "debug",
    "-hls_playlist_type",
    "event",
    "-hls_segment_type",
    "mpegts",
    "-ignore_io_errors",
    "true",
    `https://0.0.0.0:4343/upload/${guestID}/master.m3u8`,
  ];
};

export default CreateLiveHLSConfig;

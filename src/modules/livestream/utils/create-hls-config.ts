const CreateLiveHLSConfig = function (guestID: string) {
  return [
    "-i",
    "-",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-f",
    "hls",
    "-hls_time",
    "3",
    "-loglevel",
    "quiet",
    "-hls_playlist_type",
    "event",
    "-hls_segment_type",
    "fmp4",
    "-ignore_io_errors",
    "true",
    "-hls_flags",
    "independent_segments",
    `http://0.0.0.0:3000/upload/${guestID}/master.m3u8`,
  ];
};

export default CreateLiveHLSConfig;

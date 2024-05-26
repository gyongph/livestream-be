const CreateLiveHLSConfig = function (guestID: string) {
  return [
    "-i",
    "-",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-vf",
    "fps=1/60",
    "preview-image.jpg",
    "-f",
    "hls",
    "-hls_time",
    "5",
    "-loglevel",
    "quiet",
    "-hls_playlist_type",
    "event",
    "-hls_segment_type",
    "mpegts",
    "-hls_list_size",
    "5",
    "-ignore_io_errors",
    "true",
    "-hls_flags",
    "independent_segments",
    "-hls_base_url",
    `https://livestream-service.gybeongotan.gg/live/${guestID}/`,
    `http://0.0.0.0:5001/upload/${guestID}/master.m3u8`,
  ];
};

export default CreateLiveHLSConfig;

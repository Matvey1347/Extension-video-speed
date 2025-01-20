const DEF_VIDEO_SELECTORS = ["#my-player_html5_api", ".html5-main-video"];

function setVideosSpeed(videoSelectors, speed) {
  const videos = videoSelectors.flatMap((selector) =>
    selector ? Array.from(document.querySelectorAll(selector)) : []
  );
  console.log("Found video elements:", videos);
  videos.forEach((video) => {
    video.playbackRate = speed;
  });
}

chrome.storage.sync.get(["videoSpeed", "videoSelectors"], (data) => {
  const videoSpeed = data.videoSpeed || 1;
  const videoSelectors = data.videoSelectors
    ? [...DEF_VIDEO_SELECTORS, ...data.videoSelectors]
    : DEF_VIDEO_SELECTORS;

  setVideosSpeed(videoSelectors, videoSpeed);
});

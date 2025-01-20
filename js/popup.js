const DEF_VIDEO_SELECTORS = ["#my-player_html5_api", ".html5-main-video"];

document.addEventListener("DOMContentLoaded", () => {
  const speedInput = document.querySelector("#speedInput");
  const videoSelectorsTextarea = document.querySelector("#videoSelectors");
  const applyButton = document.querySelector("#applySpeed");
  const messagePreview = document.querySelector("#message_preview");

  const messageTypes = {
    success: "_success",
    error: "_error",
  };

  function setMessage(message, type = messageTypes.error) {
    messagePreview.classList.remove(...Object.values(messageTypes));
    messagePreview.classList.add(type);
    messagePreview.classList.remove("_hide");
    messagePreview.textContent = message;
  }

  function hideMessage() {
    messagePreview.classList.add("_hide");
    messagePreview.textContent = "";
  }

  chrome.storage.sync.get(["videoSpeed", "videoSelectors"], (data) => {
    let videoSpeed = 1;
    let videoSelectors = DEF_VIDEO_SELECTORS;

    if (data.videoSpeed) {
      videoSpeed = data.videoSpeed;
      speedInput.value = videoSpeed;
    }

    if (data.videoSelectors) {
      videoSelectors = [...DEF_VIDEO_SELECTORS, ...data.videoSelectors];
      videoSelectorsTextarea.value = data.videoSelectors
        .filter((item) => !DEF_VIDEO_SELECTORS.includes(item))
        .join(", ");
    }

    // Автоматически применяем ускорение к видео
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (videoSelectors, videoSpeed) => {
          function setVideosSpeed(videoSelectors, speed) {
            const videos = videoSelectors.flatMap((selector) =>
              selector ? Array.from(document.querySelectorAll(selector)) : []
            );
            console.log("Found video elements:", videos);
            videos.forEach((video) => {
              video.playbackRate = speed;
              console.log("Video speed set to:", video.playbackRate);
            });
          }
          setVideosSpeed(videoSelectors, videoSpeed);
        },
        args: [videoSelectors, videoSpeed],
      });
    });

    applyButton.addEventListener("click", () => {
      hideMessage();
      const videoSpeed = parseFloat(speedInput.value);

      const videoSelectorsValue = videoSelectorsTextarea.value
        .split(",")
        .map((item) => item.trim());
      let videoSelectors = DEF_VIDEO_SELECTORS;

      if (videoSelectorsValue && videoSelectorsValue.length) {
        videoSelectors = [...DEF_VIDEO_SELECTORS, ...videoSelectorsValue];
      }

      if (isNaN(videoSpeed) || videoSpeed <= 0) {
        setMessage("Please enter a valid speed greater than 0.");
        return;
      }

      chrome.storage.sync.set(
        {
          videoSpeed,
          videoSelectors,
        },
        () => {
          setMessage("Data successfully saved", messageTypes.success);
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (videoSelectors, videoSpeed) => {
                function setVideosSpeed(videoSelectors, speed) {
                  const videos = videoSelectors.flatMap((selector) =>
                    selector ? Array.from(document.querySelectorAll(selector)) : []
                  );
                  console.log("Found video elements:", videos);
                  videos.forEach((video) => {
                    video.playbackRate = speed;
                    console.log("Video speed set to:", video.playbackRate);
                  });
                }
                setVideosSpeed(videoSelectors, videoSpeed);
              },
              args: [videoSelectors, videoSpeed],
            });
          });
        }
      );
    });
  });
});
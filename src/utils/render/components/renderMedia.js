import { h } from "vue";

export const renderMedia = (content) => {
    return h(
      content.type,
      {
        src: content.source,
        controls: true,
        volume: content.volume || 0.5,
        style: {
          width: "90%",
          maxHeight: content.type == "audio" ? "30px" : "320px",
        },
      },
      { default: () => "Your browser does not support the video element." }
    );
  };
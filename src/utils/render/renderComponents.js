
import { Checkbox } from "@vicons/tabler";
import { h } from "vue";
import { NButton, NIcon, NSpace, NText } from "naive-ui";

export const handleCopyImg = (src) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  img.crossOrigin = "Anonymous";
  img.src = src;

  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(async (blob) => {
      // console.log(blob);
      const data = [
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ];
      // https://w3c.github.io/clipboard-apis/#dom-clipboard-write
      await navigator.clipboard.write(data).then(
        () => {
          console.log("Copied to clipboard successfully!");
        },
        () => {
          console.error("Unable to write to clipboard.");
        }
      );
    });
  };
};

export const renderTitle = (title) => {
  return h(NButton, {
    size: "small",
    type: "success",
    bordered: false,
    tertiary: true,
  },
    {
      default: () => title,
      icon: () => h(Checkbox),
    }
  )
};
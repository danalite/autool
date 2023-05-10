
import { Checkbox } from "@vicons/tabler";
import { h } from "vue";
import { NButton, NIcon, NSpace, NText } from "naive-ui";

export const querySearch = (query, searchType, params) => {
    return new Promise(function (resolve, reject) {
      var server = new WebSocket("ws://localhost:5678");
      server.onopen = function () {
        server.send(
          JSON.stringify({
            event: "I_EVENT_WSS_REQ",
            value: `${searchType}`,
            query: query,
            params: params,
          })
        );
      };
      server.onerror = function (err) {
        reject(err);
      };
      server.onmessage = function (e) {
        resolve(e.data);
        server.close();
      };
    });
  }

export function traverse(o, func) {
    for (var i in o) {
        func.apply(this, [i, o[i]]);
        if (o[i] !== null && typeof o[i] == "object") {
            traverse(o[i], func);
        }
    }
}

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

export const genUUID = () => {
    var dt = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
    return uuid;
}
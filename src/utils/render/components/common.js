
import { Bookmark } from "@vicons/tabler";
import { h } from "vue";
import { NButton, NIcon, NTag } from "naive-ui";

export const querySearchCb = (query, searchType, params, callback = () => { }) => {
    return new Promise(function (resolve, reject) {
        var server = new WebSocket("ws://localhost:5678");

        server.onopen = function () {
            server.send(
                JSON.stringify({
                    event: "I_EVENT_WSS_REQ",
                    value: searchType,
                    query: query,
                    params: params,
                })
            );
        };
        server.onerror = function (err) {
            reject(err);
        };
        server.onmessage = function (e) {
            const resp = callback(e.data);
            if (resp == "__DONE__") {
                server.close();
                // console.log("[ INFO ] querySearchStream done");
            }
        };

        resolve({
            server: server,
        });
    });
}

const registerUioEventCb = (content, callback) => {
    var callback = "SegmentationRequest";
    ipcRenderer.send("to-console", {
        action: "uio-event",
        source: "canvasWindow",
        type: "mouseClicked",
        callback: callback,
        targetWindow: content.params.window,
        wallTime: 200,
    });

    // Triggered every time when user click on the canvas
    ipcRenderer.on(callback, (event, data) => {
        let params = {
            ...content.params,
            ...data,
        };
        callback(params);
    });
}

export const parseCron = (cron, num = 25) => {

    let interval = require("cron-parser").parseExpression(cron);

    var count = 0;
    var nextDates = [];
    var hasNext = true;
    while (hasNext && count < num) {
        try {
            var obj = interval.next();
            nextDates.push({ stamp: obj.getTime() });
            count++;
        } catch (e) {
            hasNext = false;
            break;
        }
    }
    return nextDates;
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
    return h(NTag, {
        size: "medium",
        type: "info",
        bordered: false,
        tertiary: true,
    },
        {
            default: () => title,
            icon: () => h(NIcon, null, { default: () => h(Bookmark) }),
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
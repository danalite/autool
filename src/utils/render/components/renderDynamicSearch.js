
import { h, ref, computed } from "vue";
import { NSpace, NUpload, NText, NInputGroup, NInput, NSpin } from "naive-ui";

import { renderTitle } from "./common";
import { renderCarousel } from "./renderCarousel";
import { queryResults } from "@/render/components/assist/cards/queryResults";

import { querySearch, querySearchStream } from "@/render/utils/querySearch";
import { ipcRenderer } from "electron";

import { useStore } from "@/render/store";
const store = useStore();
const loadingElements = ref([]);

const renderDynamicUpdate = (content) => {
    const paramsServer = content.params?.server;
    const showType = retValues[content.key]?.type ?? "text";

    if (paramsServer != null) {
        // Need continuous processing of selected item
        return h(
            NSpace,
            { vertical: true },
            {
                default: () => [
                    renderTitle("Preview"),

                    // return loading page if no data
                    loadingElements.value.find((item) => item === content.key)
                        ? h(NSpin, { size: "small" })
                        : showType == "text"
                            ? h(
                                NText,
                                { style: { "font-size": "14px" } },
                                {
                                    default: () => retValues[content.key],
                                }
                            )
                            : renderCarousel(retValues[content.key]),
                ],
            }
        );
    } else {
        return h(NUpload, {
            listType: "image",
            style: { width: "300px" },
            fileList: retValues[content.key],
            onUpdateFileList: (value) => {
                // console.log("[ INFO ] onUpdateChange ", value);
                retValues[content.key] = value;
            },
        });
    }
};

const rawOptions = ref([]);
const dynamicOptions = computed(() => {
    return rawOptions.value.map((item) => {
        return { ...item };
    });
});


export const renderDynamicInput = (content) => {
    if (store.getReturnValue()[content.key] == null) {
        store.setValue(content.key, [])
    }

    // search == "Files": search for files
    if (content.search == "Segmentation") {

        var callback = "SegmentationRequest";
        ipcRenderer.send("to-console", {
            action: "uio-event",
            source: "canvasWindow",
            type: "mouseClicked",
            callback: callback,
            targetWindow: content.params.window,
            wallTime: 200,
        });
        // assume to capture the active window only
        ipcRenderer.on(callback, (event, data) => {
            let params = {
                ...content.params,
                ...data,
            };
            querySearch("predict", content.search, params)
                .then(function (mask) {
                    let maskData = JSON.parse(mask);
                    ipcRenderer.send("to-console", {
                        action: "load-image",
                        path: maskData.image,
                    });

                    ipcRenderer.once("image-loaded", (event, content) => {
                        maskData.content = content;
                        emits("drawMask", maskData);

                        // Add image mask to segmentation list
                        rawOptions.value.push({
                            label: `mask`,
                            src: content,
                        });
                    });
                })
                .catch(function (err) {
                    console.log("[ ERROR ] querySearch ", err);
                });
        });
    }

    return h(
        NSpace,
        { vertical: true },
        {
            default: () => [
                renderTitle(content.label),
                content.search == "Segmentation"
                    ? null
                    : h(
                        NInputGroup,
                        { size: "small" },
                        {
                            default: () => [
                                h(NInput, {
                                    placeholder: "Search",
                                    size: "small",
                                    round: true,
                                    style: { "font-size": "14px", width: "250px" },
                                    onUpdateValue: (value) => {
                                        if (value == "") {
                                            rawOptions.value = [];
                                            return;
                                        }
                                        querySearch(value, content.search, content.params)
                                            .then(function (data) {
                                                rawOptions.value = JSON.parse(data);
                                                // console.log("[ INFO ] querySearch ", rawOptions.value);
                                            })
                                            .catch(function (err) {
                                                console.log("[ ERROR ] querySearch ", err);
                                            });
                                    },
                                }),
                            ],
                        }
                    ),

                // Equivalent to <query-results :queryResults={queryResults} />
                h(queryResults, {
                    options: dynamicOptions.value,
                    style: { width: "300px" },
                    onCustomEvent: (data) => {
                        // console.log("Custom event triggered", data);
                        // Specially quick path for app launcher
                        if (content.max == 1) {
                            retValues[content.key] = data;
                            if (content.instantQuit) {
                                store.clearCurrentSession();
                            }
                        } else {
                            if (content.params?.server != null) {
                                retValues[content.key] = "";
                                loadingElements.value.push(content.key);
                                const params = {
                                    ...content.params,
                                    queryKey: data.value,
                                };

                                querySearchStream("SelectItem", params, (resp) => {
                                    // Type1: get streamed data from the server
                                    loadingElements.value = loadingElements.value.filter(
                                        (item) => item !== content.key
                                    );
                                    const v = JSON.parse(resp);
                                    if (v.type == "text") {
                                        retValues[content.key] = retValues[content.key] + v.content;
                                    } else {
                                        retValues[content.key] = v;
                                    }
                                });
                            } else {
                                // Select item into a list
                                let item = {
                                    id: data.label,
                                    name: data.value,
                                    status: "finished",
                                };
                                if (retValues[content.key].every((i) => i.name !== item.name)) {
                                    retValues[content.key].push(item);
                                }
                            }
                        }
                    },
                }),
                renderDynamicUpdate(content),
            ],
        }
    );
};

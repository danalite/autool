import { h } from "vue";
import { NButton, NIcon, NSpace, NText, NCarousel, NCarouselItem, NSwitch } from "naive-ui";
import { renderTitle, handleCopyImg } from "./common";
import { ExternalLink } from "@vicons/tabler";

import { useStore } from "@/render/store";
const store = useStore();

export const renderCarousel = (content) => {
    const options = content.content.map((item) => {
      // if item is of type string, convert it to object
      if (typeof item === "string") {
        return {
          label: item,
          value: item,
        };
      } else {
        return item;
      }
    });
    return h(
      NSpace,
      { style: { "margin-top": "5px", "margin-bottom": "2px" } },
      {
        default: () => [
          content.label ? renderTitle(content.label) : null,
          h(
            NCarousel,
            {
              effect: "card",
              "prev-slide-style":
                "transform: translateX(-150%) translateZ(-800px);",
              "next-slide-style":
                "transform: translateX(50%) translateZ(-800px);",
              style: { height: "180px", width: "290px" },
              "show-dots": false,
            },
            {
              default: () =>
                options.map((item) => {
                  return h(
                    NCarouselItem,
                    { style: { width: "75%" } },
                    {
                      default: () => [
                        h("img", {
                          src: item.value,
                          onClick: () => handleCopyImg(item.value),
                          height: "180",
                          "object-fit": "fill",
                          "preview-disabled": true,
                        }),
                        h(
                          NButton,
                          {
                            size: "small",
                            circle: true,
                            type: "info",
                            onClick: () => shell.openExternal(item.value),
                            style: {
                              position: "absolute",
                              bottom: "8px",
                              right: "8px",
                            },
                          },
                          {
                            default: () =>
                              h(
                                NIcon,
                                { size: 20 },
                                { default: () => h(ExternalLink) }
                              ),
                          }
                        ),
                        content.key != null
                          ? h(
                              NSwitch,
                              {
                                round: false,
                                style: {
                                  position: "absolute",
                                  bottom: "8px",
                                  left: "8px",
                                },
                                onUpdateValue: (select) => {
                                  const returnValues = store.getReturnValue();
                                  var v = returnValues[content.key];
                                  if (!v) {
                                    v = [];
                                  }

                                  if (select) {
                                    v.push(item);
                                  } else {
                                    v.splice(v.indexOf(item), 1);
                                  }
                                  store.setValue(content.key, v);
                                },
                              },
                              {
                                default: () => null,
                              }
                            )
                          : null,
                      ],
                    }
                  );
                }),
            }
          ),
        ],
      }
    );
  };
import { h } from "vue";
import { NSpace, NAlert, NList, NScrollbar, NListItem, NCard, NSwitch } from "naive-ui";

import { renderTitle, handleCopyImg } from "./common";
import { useStore } from "@/render/store";
const store = useStore();

export const renderImageCards = (session, content) => {
  const options = content.content.map((item) => {
    if (typeof item === "string") {
      return {
        label: item,
        value: item,
      };
    } else {
      return item;
    }
  })

  const active_items_key = `__${session}_ACTIVE_LABELS__`
  if (!store.getReturnValue(session)[active_items_key]) {
    store.setValue(session, active_items_key, options);
  }

  return h(
    NSpace,
    { vertical: true, style: { "margin-top": "5px", "margin-bottom": "2px" } },
    {
      default: () => [
        content.label ? renderTitle(content.label) : null,
        store.getReturnValue(session)[active_items_key].length == 0 ?
          h(NAlert, {
            type: "warning", bordered: false, style: {
              width: "270px",
              marginTop: "10px",
            }
          }, { default: () => "No Content" })
          :
          h(
            NList,
            {
              style: {
                marginTop: "0px"
              },
              showDivider: false,
              hoverable: false
            },
            {
              default: () =>
                h(NScrollbar, { style: {maxHeight: '450px'} }, {
                  default: () =>
                    store.getReturnValue(session)[active_items_key].map((item) => {
                      return h(
                        NListItem,
                        { style: { padding: '8px', margin: '0px' } },
                        {
                          default: () => 
                          h(NCard, 
                            {
                              title: item.label,
                              style: {
                                width: "250px"
                              },
                              size: "small",
                              hoverable: true,
                              closable: true,
                              onClose: () => {
                                const v = store.getReturnValue(session)[active_items_key].filter((i) => i.label != item.label);
                                store.setValue(session, active_items_key, v);
                              }
                            },
                            {
                              default: () => content.key != null
                              ? h(
                                NSwitch,
                                {
                                  round: false,
                                  size: "small",
                                  style: {
                                    marginTop: "8px",
                                  },
                                  onUpdateValue: (select) => {
                                    const returnValues = store.getReturnValue(session);
                                    var v = returnValues[content.key];
                                    if (!v) {
                                      v = [];
                                    }

                                    if (select) {
                                      v.push(item);
                                    } else {
                                      v.splice(v.indexOf(item), 1);
                                    }
                                    store.setValue(session, content.key, v);
                                  },
                                },
                                {
                                  default: () => null,
                                }
                              )
                              : "NULL",
                              cover: () => h("img", {
                                src: item.value,
                                onClick: () => handleCopyImg(item.value),
                                height: "180",
                                "object-fit": "fill",
                                "preview-disabled": true,
                              })
                            }
                          )
                        }
                      );
                    })
                }),
            },
          ),
      ],
    }
  );
};
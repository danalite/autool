import { h } from "vue";
import { NCheckbox, NCheckboxGroup, NGrid, NGridItem, NSpace, NText, NButton, NIcon } from "naive-ui";

import { renderTitle } from "./common";
import { useStore } from "@/render/store";
import { Copy, X } from "@vicons/tabler";

const store = useStore();

const handleClose = (session, key, option) => {
  const negateKey = `"__NEGATE_${key}__`;
  const options = store.getReturnValue(session)[key];
  options.push(option);
  store.setValue(session, key, options);

  const negate_options = store.getReturnValue(session)[negateKey].filter((item) => item != option);
  store.setValue(session, negateKey, negate_options);
  // console.log("[ INFO ] handleClose ", negateKey, negate_options, options);
}

const renderClosableMode = (session, options, content) => {
  // Store values that are deselected
  const negateKey = `"__NEGATE_${content.key}__`;
  if (store.getReturnValue(session)[content.key] == null) {
    let v = options.map((item) => item.value);
    store.setValue(session, content.key, []);
    store.setValue(session, negateKey, v);
  }
  return h(NGrid, {
    yGap: 8,
    cols: 1,
  }, {
    default: () => store.getReturnValue(session)[negateKey].map((option) =>
      h(NGridItem, {
        span: 1
      },
        {
          default: () => [
            h(NButton, {
              quaternary: true,
              size: "small",
              type: "success",
              onClick: () => {
                handleClose(session, content.key, option);
              }
            },
              {
                default: () =>
                  h(NIcon, { depth: 3, color: "red" }, { default: () => h(X) })
              }),
            h(NButton, {
              quaternary: true,
              size: "small",
              type: "success",
              onClick: () => {
                navigator.clipboard.writeText(option);
              },
              style: {
              }
            },
              {
                default: () =>
                  h(NIcon, { depth: 3, color: "green" }, { default: () => h(Copy) })
              }),
            h(NSpace, {
              style: {
                "margin-top": "0px",
                "margin-right": "5px",
                "padding": "8px",
                "background-color": "rgba(220,220,220,0.2)",
              }
            }, {
              default: () => [
                h(NText,
                  {
                    style: {
                      "font-size": "14px",
                      "line-height": "0px",
                    }
                  },
                  { default: () => option }
                ),
              ]
            })
          ]
        }
      )

    )
  })
}

export const renderCheckbox = (session, content) => {
  const options = content.content.map((item) => {
    // if item is of type string, convert it to object
    if (typeof item === "string") {
      return {
        label: item,
        value: item,
      };
    } else {
      return {
        label: item.label,
        value: item.value,
      };
    }
  });
  const instantQuit = content.options?.instantQuit ?? false;
  const max = content.options?.max ?? options.length;

  return h(
    NSpace,
    { vertical: true },
    {
      default: () => [
        renderTitle(content.label),
        content.closableMode ? renderClosableMode(session, options, content) :
          h(
            NCheckboxGroup,
            {
              onUpdateValue: (value) => {
                // console.log("[ INFO ] onUpdateValue ", value);
                store.setValue(session, content.key, value);
                if (instantQuit && max === 1) {
                  store.getSession(session).destroy();
                }
              },
              style: { "margin-left": "30px" },
              defaultValue: content.preset,
              max: content.max,
              min: content.min,
            },
            {
              default: () =>
                h(
                  NGrid,
                  {
                    yGap: 8,
                    cols: 1,
                  },
                  {
                    default: () =>
                      options.map((option) =>
                        h(
                          NGridItem,
                          {
                            span: 1,
                          },
                          {
                            default: () => [
                              h(
                                NCheckbox,
                                {
                                  label: option.label,
                                  value: option.value,
                                },
                                {
                                  default: () =>
                                    h(NSpace, {
                                      style: {
                                        "margin-top": "0px",
                                        "margin-right": "12px",
                                        "padding-left": "8px",
                                        "padding-right": "8px",
                                        "background-color": "rgba(220,220,220,0.2)",
                                      }
                                    },
                                      {
                                        default: () =>
                                          h(NText,
                                            {
                                              style: {
                                                "font-size": "14px",
                                                "line-height": "0px",
                                              }
                                            },
                                            { default: () => option.label }
                                          ),
                                      }
                                    )
                                }
                              ),
                              h(NButton, {
                                quaternary: true,
                                size: "small",
                                type: "success",
                                onClick: () => {
                                  navigator.clipboard.writeText(option.value);
                                },
                                style: {
                                  margin: "5px",
                                  position: "absolute",
                                  right: "3px"
                                }
                              },
                                {
                                  default: () =>
                                    h(NIcon, { depth: 3, color: "green" }, { default: () => h(Copy) })
                                })
                            ],
                          }
                        )
                      ),
                  }
                ),
            }
          ),
      ],
    }
  );
};
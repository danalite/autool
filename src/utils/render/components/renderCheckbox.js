import { h } from "vue";
import { NCheckbox, NCheckboxGroup, NGrid, NGridItem, NSpace, NText } from "naive-ui";

import { renderTitle } from "./common";
import { useStore } from "@/render/store";
const store = useStore();

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
    return h(
      NSpace,
      { vertical: true },
      {
        default: () => [
          renderTitle(content.label),
          h(
            NCheckboxGroup,
            {
              onUpdateValue: (value) => {
                store.setValue(session, content.key, value);
                if (content.instantQuit && content.max === 1) {
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
                            default: () =>
                              h(
                                NCheckbox,
                                {
                                  label: option.label,
                                  value: option.value,
                                },
                                {
                                  default: () =>
                                    h(
                                      NText,
                                      {
                                        style: {
                                          "font-size": "14px",
                                          "line-height": "0px",
                                        },
                                      },
                                      { default: () => option.label }
                                    ),
                                }
                              ),
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
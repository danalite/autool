import { h } from "vue";
import { NInputNumber, NSpace, NText, NSlider } from "naive-ui";
import { renderTitle } from "./common";

import { useStore } from "@/render/store";
const store = useStore();

export const renderNumberInput = (session, content) => {
    return h(
      NSpace,
      { vertical: true, style: { "margin-top": "5px", "margin-bottom": "2px" } },
      {
        default: () => [
          renderTitle(content.label),
          content.range ? h(NSlider, {
            size: "small",
            step: 10,
            onUpdateValue: (value) => {
              if (content.key) {
                store.setValue(session, content.key, value);
              }
            },
            style: { "font-size": "14px", width: "250px" },
          }) :
          h(NInputNumber, {
            // placeholder: content.default,
            size: "small",
            style: { "font-size": "14px", width: "250px" },
            onUpdateValue: (value) => {
              if (content.key) {
                // update number in the global store
                store.setValue(session, content.key, value);
              }
            },
          }),
        ],
      }
    );
  };
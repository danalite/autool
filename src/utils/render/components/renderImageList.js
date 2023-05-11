import { h } from "vue";
import {  NSpace } from "naive-ui";
import { renderTitle } from "./common";
import queryResults from "@/render/components/assist/cards/queryResults";

export const renderImageList = (content) => {
    const options = content.content.map((item) => {
      return {
        ...item,
        width: 100,
      };
    });
    return h(
      NSpace,
      { vertical: true },
      {
        default: () => [
          renderTitle(content.label),
          h(queryResults, {
            options: options,
            style: { width: "290px" },
            onCustomEvent: (data) => {
              console.log(data);
              // store.setValue(content.key, data);
            }
          }),
        ],
      }
    );
  };

import { Checkbox } from "@vicons/tabler";
import { h } from "vue";
import { NIcon, NSpace, NText } from "naive-ui";

export const renderTitle = (title) => {
    return h(
      NSpace,
      {},
      {
        default: () => [
          h(
            NIcon,
            { size: 16, color: "#0e7a0d" },
            { default: () => h(Checkbox) }
          ),
          h(
            NText,
            {
              style: {
                "font-size": "15px",
                "line-height": "0px",
                "color": "#df4040",
                'font-weight': 'bold'
              },
            },
            {
              default: () => title,
            }
          ),
        ],
      }
    );
  };
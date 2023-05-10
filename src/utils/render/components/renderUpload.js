import { h } from "vue";
import { NButton, NSpace, NUpload } from "naive-ui";
import { renderTitle } from "./common";
import { useStore } from "@/render/store";
const store = useStore();

export const renderUpload = (content) => {
    return h(
      NSpace,
      { vertical: true, style: { "margin-top": "5px", "margin-bottom": "2px" } },
      {
        default: () => [
          renderTitle(content.label),
          h(
            NUpload,
            {
              defaultFileList: [],
              listType: "image",
              onChange: (event) => {
                const { file, fileList } = event;
                // fileListRef.value = fileList;
                // console.log("[ INFO ] onChange ", JSON.stringify(fileList));
                const v = fileList.map((item) => item.file.path);
                store.setValue(content.key, v);
              },
            },
            {
              default: () =>
                h(NButton, { size: "small" }, { default: () => "Select" }),
            }
          ),
        ],
      }
    );
  };
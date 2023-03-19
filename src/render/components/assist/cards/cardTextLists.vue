<template>
  <div></div>
</template>

<script setup>
const renderTextContent = (content) => {
  let contentList = [];
  if (typeof content == "string") {
    contentList = [{ label: content, value: content }];

  // If content is an array of string, convert it to an array of object
  } else if (content.every((item) => typeof item === "string")) {
    contentList = content.map((item) => {
      return { label: item, value: item };
    });

  } else {
    contentList = content;
  }
  
  return h(
    NList,
    {
      bordered: false,
      showDivider: true,
      hoverable: true,
      clickable: true,
    },
    {
      default: () =>
        contentList.map((content) =>
          h(
            NListItem,
            {
              onClick: () => {
                navigator.clipboard.writeText(content.value);
              },
              style: {
                "padding-top": "5px",
                "padding-bottom": "5px",
              },
            },
            {
              default: () =>
                h(
                  NText,
                  {
                    style: {
                      "font-size": "14px",
                      "line-height": "0px",
                      "margin-left": "10px",
                      color: "#3a4dbf",
                      "font-family":
                        '"Lucida Console", "Courier New", monospace',
                    },
                  },
                  { default: () => content.label }
                ),
            }
          )
        ),
    }
  );
};

const enqueue = (command) => {
  let count = command.timeout;

  const nRef = notification.create({
    title: () => command.title,
    content: () => renderTextContent(command.content),

    duration: count ? count * 1000 : undefined,
    meta: () => h("span", new Date().toLocaleString()),
    action: () =>
      h(
        NSpace,
        {
          style: { "margin-top": "5px", "margin-bottom": "2px", size: [0, 0] },
        },
        {
          default: () => [
            h(
              NButton,
              {
                tertiary: true,
                size: "small",
                type: "success",
                onClick: () => {
                  nRef.destroy();
                },
              },
              {
                default: () => "Close",
              }
            ),
          ],
        }
      ),
    onAfterEnter: () => {
      if (count) {
        const minusCount = () => {
          count--;
          nRef.meta = () =>
            renderMeta(
              `task (${command.source})`,
              count ? `close in ${count} s...` : null
            );
          if (count > 0) {
            window.setTimeout(minusCount, 1e3);
          }
        };
        window.setTimeout(minusCount, 1e3);
      }
    },
  });

  // emits('refreshListeners', {})
  // console.log("Notification created: ", nRef, nRef.$el);
};

</script>
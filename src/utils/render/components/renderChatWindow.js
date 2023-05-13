
import chatWindow from "@/render/components/assist/cards/chatWindow.vue";
import { h, ref } from "vue";

const chatHistory = ref([]);
const webSocketGet = (target, params, callback = () => { }) => {
  return new Promise(function (resolve, reject) {
      var server = new WebSocket(target);

      server.onopen = function () {
          server.send(
              JSON.stringify(params)
          );
      };
      server.onerror = function (err) {
          reject(err);
      };
      server.onmessage = function (e) {
          const resp = callback(e.data);
          if (resp == "__DONE__") {
              server.close();
          }
      };

      resolve({
          server: server,
      });
  });
}


export const renderChatWindow = (content) => {
  if (chatHistory.value.length == 0) {
    const initialMessage = content.params?.init ?? "How can I help you?";
    chatHistory.value = [{ id: new Date().getTime(), content: initialMessage }]
  }
  return h(chatWindow, {
    messages: chatHistory.value,
    style: { width: "100%", height: "100%" },

    onCustomEvent: async (data) => {
      // User input
      chatHistory.value.push(data);
      if (data.content == "cmd:clear") {
        const initialMessage = content.params?.init ?? "How can I help you?";
        chatHistory.value = [{ id: new Date().getTime(), content: initialMessage }]
      }

      // Automatic response (empty placeholder)
      chatHistory.value.push({
        id: new Date().getTime(),
        content: "",
      });

      // Append the response to the chat history

      // Audio player
      // <audio>https://dds.dui.ai/runtime/v1/synthesize?voiceId=ppangf_csn&text=怎么办&speed=1&volume=50&audioType=wav</audio>

      // Link button to trigger an URL or action (deep link)
      // <link>autool://download/...</link>

      // A simple version: receives all the text from websocket server
      const server = content.params?.server ?? "";
      if (server.startsWith("ws://")) {
        webSocketGet(server, content.params, (data) => {
          console.log(data);
          // chatHistory.value[chatHistory.value.length - 1].content = [data];
          if (data == "__DONE__") {
            return "__DONE__";
          }
        });
      }
    },
  });
};
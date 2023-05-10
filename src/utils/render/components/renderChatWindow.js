
import chatWindow from "@/render/components/assist/cards/chatWindow.vue";
import { h, ref } from "vue";

const chatHistory = ref([{ content: ["How can I help you?"] }]);
const chatIndex = ref(0);

export const renderChatWindow = (content) => {
  return h(chatWindow, {
    messages: chatHistory.value,
    style: { width: "100%", height: "100%" },
    onCustomEvent: async (data) => {
      console.log("Custom event triggered", data);
      chatHistory.value.push(data);
      // Send message to the server and get stream back
      chatHistory.value.push({
        content: [""],
      });

      // Append the response to the chat history
      const testResponse = chatIndex.value % 2 == 0 ? [
        "Comment allez-vous ? (How are you?)",
        "<audio>https://dds.dui.ai/runtime/v1/synthesize?voiceId=ppangf_csn&text=怎么办我的心好痛&speed=1&volume=50&audioType=wav</audio>"
      ] : [
        "To remove images in Docker Desktop, you can run the following script:",
        "<button>Open-Docker-Settings</button>"
      ]
      chatIndex.value += 1;

      // Update the last message
      const index = chatHistory.value.length - 1;
      for (let i = 0; i < testResponse.length; i++) {
        if (testResponse[i].startsWith("<button>") || testResponse[i].startsWith("<audio>")) {
          chatHistory.value[index].content.push(testResponse[i]);
          if (i != testResponse.length - 1) {
            chatHistory.value[index].content.push("");
          } 
        } else {
          const chunkSize = 10; // set the desired chunk size
          const testText = testResponse[i];
          const contentIndex = chatHistory.value[index].content.length - 1;
          for (let i = 0; i < testText.length; i += chunkSize) {
            await new Promise((r) => setTimeout(r, 300));
            chatHistory.value[index].content[contentIndex] =
              chatHistory.value[index].content[contentIndex] +
              testText.substring(i, i + chunkSize);
          }
        }
      }
    },
  });
};
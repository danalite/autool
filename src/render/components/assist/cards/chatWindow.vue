<template>
  <n-space vertical>
    <n-scrollbar style="max-height: 520px" ref="scrollRef" id="scrollbar">
      <n-space
        style="padding-right: 10px; padding-top: 15px"
        :justify="index % 2 == 1 ? 'end' : 'start'"
        v-for="(item, index) in props.messages"
        :key="index"
      >
        <n-image
          width="30"
          preview-disabled
          v-if="index % 2 == 0"
          src="data:image/png;base64,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"
        />

        <n-space
          :style="{
            width: '175px',
            padding: '8px 12px',
            backgroundColor: index % 2 == 1 ? '#e6f7ff' : '#f5f5f5',
            fontSize: '13px',
          }"
        >
          <div v-for="p in postProc(item.content)">
            <n-button
              v-if="p.startsWith('<button>')"
              type="info"
              size="tiny"
            >
              {{ p.replace('<button>', '').replace('</button>', '') }}
            </n-button>
            <audio v-else-if="p.startsWith('<audio>')" src="https://dds.dui.ai/runtime/v1/synthesize?voiceId=ppangf_csn&text=怎么办我的心好痛&speed=1&volume=50&audioType=wav"  controls style="width: 180px; padding:0; margin:0; max-height: 25px;">
              Your browser does not support the element.
            </audio>
            <n-spin v-else-if="p == ''" size="tiny" />
            <div v-else>
              <n-text @click="copy(p)">{{ p }}</n-text>
            </div>
          </div>
        </n-space>

        <n-image
          preview-disabled
          v-if="index % 2 == 1"
          width="30"
          src="https://www.shareicon.net/data/512x512/2015/09/18/103160_man_512x512.png"
        />
      </n-space>
    </n-scrollbar>
    <n-input-group style="padding-top: 10px; margin-bottom: 10px">
      <n-input
        size="small"
        type="textarea"
        v-model:value="text"
        :autosize="{
          minRows: 1,
          maxRows: 5,
        }"
        :disabled="isWaitingResponse"
        placeholder="input..."
        class="input"
        @keyup.enter="send"
      />

      <n-button type="success" size="small" @click="send" secondary>
        <n-icon>
          <Send />
        </n-icon>
      </n-button>
    </n-input-group>
  </n-space>
</template>


<script setup>
import { computed, h, ref } from "vue";
import {
  NInput,
  NButton,
  NInputGroup,
  NSpace,
  NImage,
  NTag,
  NIcon,
  NText,
  NSpin,
  NScrollbar,
} from "naive-ui";

import { ipcRenderer, shell } from "electron";
import { Send } from "@vicons/tabler";

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
  height: {
    type: String,
    default: "280px",
  },
});

const emits = defineEmits(["customEvent"]);
const scrollRef = ref(null);

const text = ref("");
const isWaitingResponse = computed(() => {
  return props.messages[props.messages.length - 1].content == "";
});

const postProc = (content) => {
  const pattern = /(<link>[^<]*<\/link>)/g; 
  return content.split(pattern);
}

const send = () => {
  // console.log(text.value, "@@@@");
  if (text.value.trim() === "") {
    return;
  }

  // message from the user
  const textContent = text.value.trim("\n");
  const message = {
    id: new Date().getTime(),
    content: textContent,
  };

  // lock the input. waiting for the response from agent
  emits("customEvent", message);
  text.value = "";

  scrollRef.value?.scrollTo({
    behavior: "smooth",
    top: 1e5,
  });

  const element = document.getElementById("scrollbar");
  element.scrollTop = 0;
};


const copy = (text) => {
  navigator.clipboard.writeText(text);
};
</script>


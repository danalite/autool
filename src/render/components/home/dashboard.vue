<template>
  <div>
    <header v-mouse-drag="handleDrag" class="headerTitle">
    <n-space class="headerTitle">
      <img
        src="../../assets/icon/logo.png"
        draggable="false"
        width="35"
        @click="handleCollapse"
      />
      <n-text>AuTool</n-text>
      <n-space v-if="pageCount > 0">
        <n-tag
          :bordered="false"
          round
          v-if="serverLatency > 0"
          type="success"
          size="small"
        >
          {{ serverLatency }}ms
        </n-tag>
        <n-tag :bordered="false" round v-else type="warning" size="small">
          offline
        </n-tag>
      </n-space>

      <n-space v-else style="padding-bottom: 2px;">
        <n-button
          :bordered="false"
          type="success"
          secondary
          size="tiny"
          style="margin-right: 5px"
          @click="showSelectedTasks($event)"
        >
          excel-helper
        </n-button>
        <n-tag
          :bordered="false"
          type="warning"
          size="small"
          style="margin-right: 5px"
        >
          FUCK
        </n-tag>
        <n-tag
          :bordered="false"
          type="warning"
          size="small"
          style="margin-right: 5px"
        >
          FUCK
        </n-tag>
        <n-input-group>
          <n-button text circle color="#0e7a0d" @click="" size="small">
            <n-icon size="25">
              <ChevronLeft />
            </n-icon>
          </n-button>
          <n-button text circle color="#0e7a0d" @click="" size="small">
            <n-icon size="25">
              <ChevronRight />
            </n-icon>
          </n-button>
        </n-input-group>

      </n-space>
    </n-space>

    <n-space class="rightCorner" v-show="pageCount > 0">
      <n-popover :show-arrow="false" trigger="hover" :delay="200">
        <template #trigger>
          <n-button text @click="toSettingPage">
            <n-icon v-if="pageCount == 1" size="25">
              <Settings />
            </n-icon>
            <n-icon v-else-if="pageCount == 2" size="25" color="#ff69b4">
              <ArrowLeft />
            </n-icon>
          </n-button>
        </template>
        {{ pageCount == 1 ? "Settings" : "Back" }}
      </n-popover>

      <n-popover :show-arrow="false" trigger="hover" :delay="1000">
        <template #trigger>
          <n-button text @click="handleMin" color="black">
            <n-icon size="25">
              <chevrons-down-right />
            </n-icon>
          </n-button>
        </template>
        Minimize
      </n-popover>

      <n-popover :show-arrow="false" trigger="hover" :delay="1000">
        <template #trigger>
          <n-button text circle color="black" @click="handleClose">
            <n-icon size="24">
              <circle-x />
            </n-icon>
          </n-button>
        </template>
        Close
      </n-popover>
      
    </n-space>
  </header>
  </div>

</template>

<script setup>
import {
  NIcon,
  NSpace,
  NButton,
  NPopover,
  NPopconfirm,
  NScrollbar,
  NInputGroup,
  NCollapseTransition,
  NTag,
  NText,
  NAvatar,
  useMessage,
} from "naive-ui";

import {
  ChevronsDownRight,
  Settings,
  CircleX,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "@vicons/tabler";

import { useStore } from "@/render/store";
import { ipcRenderer } from "electron";
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { appConfig } from "@/utils/main/config";
import { request } from "@/utils/render/request";

const store = useStore();
let { pageCount } = storeToRefs(store);

const message = useMessage();
let connFailureCount = 0;
let serverLatency = ref(0);
let isCollapsed = ref(false);

const toSettingPage = () => {
  store.pageIncrease();
};

const handleDrag = (pos) => {
  ipcRenderer.send("move-main", {
    x: pos.x,
    y: pos.y,
  });
};

const handleMinimize = () => {
  ipcRenderer.send("main-win-minimize");
};

const handleMin = () => {
  ipcRenderer.send("main-win-min");
};

const handleClose = () => {
  ipcRenderer.send("main-win-close");
};

const handleCollapse = () => {
  let newDim = isCollapsed.value
    ? { width: 390, height: 650 }
    : { width: 450, height: 45 };
  isCollapsed.value = !isCollapsed.value;

  if (isCollapsed.value) {
    store.pageReset(0);
  } else {
    store.pageReset(1);
  }
  ipcRenderer.send("main-win-resize", newDim);
  appConfig.set("mainWindowDimension", newDim);
};

// reLoad local apps before collapse
const selectedApps = ref([]);

function testLatency() {
  var start = new Date().getTime();
  request({
    url: "http://173.82.48.51:8080/ping",
    method: "GET",
  })
    .then((res) => {
      var lat = new Date().getTime() - start;
      serverLatency.value = lat;
      connFailureCount = 0;
    })
    .catch((err) => {
      serverLatency.value = 0;
      if (connFailureCount === 0) {
        message.error(
          "Cannot reach remote server. Please check internet connection"
        );
      }
      connFailureCount++;
    });
}

onMounted(() => {
  testLatency();
  let timer = setInterval(() => {
    testLatency();
    if (connFailureCount > 5) {
      clearInterval(timer);
    }
  }, 5000);
});

const headerMargin = ref("10px 16px 10px");
const headerHeight = ref("50px");
watch(pageCount, (page) => {
  if (page == 0) {
    headerHeight.value = "23px";
    headerMargin.value = "13px 8px 0px";
  } else {
    headerHeight.value = "50px";
    headerMargin.value = "10px 16px 10px";
  }
});

const selectedTasks = ref([]);
const showSelectedTasks = (e) => {
  selectedTasks.value.push("nids")
  console.log("selectedTasks", selectedTasks.value)
};

</script>

<style scoped>
header {
  display: flex;
  height: v-bind("headerHeight");
  justify-content: space-between;
  margin: v-bind("headerMargin");
}

.rightCorner {
  padding-top: 8px;
  margin-right: 3px;
}

.headerTitle {
  align-items: center;
}

.n-text {
  /* font-weight: 560; */
  font-size: 20px;
  color: darkgray;
  line-height: 0.9em;
}

.gradient-text {
  /* Fallback: Set a background color. */
  background-color: darkgrey;

  /* Create the gradient. */
  background-image: linear-gradient(
    90deg,
    /* #CA4246 16.666%, 
        #E16541 16.666%, 
        #E16541 33.333%, 
        #F18F43 33.333%,  */
      #fcbad3 16.666%,
    darkgrey 83.333%
  );

  /* Set the background size and repeat properties. */
  background-size: 100%;
  background-repeat: repeat;

  /* Use the text as a mask for the background. */
  /* This will show the gradient as a text color rather than element bg. */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  /* Animate the text when loading the element. */
  /* This animates it on page load and when hovering out. */
  animation: rainbow-text-simple-animation-rev 0.75s ease forwards;
}

.gradient-text:hover {
  animation: rainbow-text-simple-animation 0.5s ease-in forwards;
}

/* Move the background and make it smaller. */
/* Animation shown when entering the page and after the hover animation. */
@keyframes rainbow-text-simple-animation-rev {
  0% {
    background-size: 650%;
  }
  40% {
    background-size: 650%;
  }
  100% {
    background-size: 100%;
  }
}

/* Move the background and make it larger. */
/* Animation shown when hovering over the text. */
@keyframes rainbow-text-simple-animation {
  0% {
    background-size: 100%;
  }
  80% {
    background-size: 650%;
  }
  100% {
    background-size: 650%;
  }
}
</style>

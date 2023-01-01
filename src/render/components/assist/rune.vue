<template>
  <div>
    <n-card class="boxShadow" size="small">
      <n-space justify="center" vertical>
        <p style="color: #9aa4af">Autorun tasks</p>
        <p style="color: #9aa4af">英雄选择阶段才可以使用符文配置功能</p>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { ipcRenderer } from "electron";
import {
  NCard,
  NAvatar,
  NSpace,
  NTag,
  NGrid,
  NGi,
  NIcon,
  NBadge,
  NButton,
  NPopconfirm,
  useMessage,
} from "naive-ui";
import { ref } from "vue";
import { champDict, mapNameFromUrl } from "../../../utils/render/lolDataList";
import { appConfig } from "../../../utils/main/config";
import { ArrowBigRightLine, ArrowBigLeftLine } from "@vicons/tabler";
import { request } from "../../../utils/render/request";
import { applyRunePage, setAutoRuneFromChamp } from "@/utils/main/lcu";

const currentChamp = ref(null);
const currentChampImgUrl = ref("");
const currentChampName = ref("请先选择英雄");
const currentChampAlias = ref("");
let runeDataList = [];
const runeDataListFor = ref([]);
let pageStart = 0;
let pageEnd = 0;
const isAutoRune = ref(0);
const loading = ref(true);
const skillsAndItems = ref([]);
const itemCount = ref(1);
const credentials = appConfig.get("credentials");
let currentGameMode = "";

const message = useMessage();

ipcRenderer.on("show-other-summoner", () => {
  runeDataListFor.value.length = 0;
});
ipcRenderer.on("query-other-summoner", () => {
  currentGameMode = "";
});

ipcRenderer.on("current-champ-select", (event, data) => {
  if (data.champId === 0 || data.champId.httpStatus === 404) {
    return;
  }
  if (data.champId != currentChamp.value) {
    runeDataList = [];
    skillsAndItems.value = [];
    itemCount.value = 1;
    isAutoRune.value =
      appConfig.has(`autoRune.${data.champId}`) == true ? "auto" : 0;
    currentChamp.value = data.champId;
    mapChamp(data.champId);
    getRuneData(data.mode);
  }
  // 设置当前游戏模式
  if (currentGameMode === "") {
    currentGameMode = data.mode;
  }
});

const getRuneData = async (gameMode) => {
  // 判断当前英雄是否配置看自动符文
  if (appConfig.has(`autoRune.${currentChamp.value}`)) {
    applyRunePage(credentials, appConfig.get(`autoRune.${currentChamp.value}`));
  }
  let champInfo;
  try {
    if (gameMode === "aram" && currentGameMode === "aram") {
      champInfo = (
        await request({
          // `https://unpkg.com/@java_s/op.gg-aram/${currentChampAlias.value}.json`
          url: `https://frank-1304009809.cos.ap-chongqing.myqcloud.com/op.gg-aram/${currentChampAlias.value}.json`,
          method: "GET",
        })
      ).data;
    } else {
      // https://unpkg.com/@java_s/op.gg/${currentChampAlias.value}.json`
      champInfo = (
        await request({
          url: `https://frank-1304009809.cos.ap-chongqing.myqcloud.com/op.gg/${currentChampAlias.value}.json `,
          method: "GET",
        })
      ).data;
    }
    // 技能
    getSkillsImgUrl(champInfo[0].skillsImg, champInfo[0].skills);

    for (const champ of champInfo) {
      // 符文
      for (const rune of champ.runes) {
        if (gameMode == "aram" && currentGameMode === "aram") {
          rune.position = "aram";
        }
        runeDataList.push(rune);
      }
      // 装备
      getItemImgUrl(champ.itemBuilds[0].blocks);
    }

    pageStart = 0;
    pageEnd = runeDataList.length > 4 ? 4 : runeDataList.length;
    runeDataListFor.value = runeDataList.slice(pageStart, pageEnd);
    if (appConfig.has(`autoRune.${currentChamp.value}`)) {
      message.success("自动配置符文成功");
    }
  } catch (e) {
    console.log(e);
  }
};
// getRuneData()

// 切换不同的装备进行显示
const changeItemsImg = () => {
  if (itemCount.value < skillsAndItems.value.length - 1) {
    itemCount.value += 1;
  } else {
    itemCount.value = 1;
  }
};

// 获取装备图片链接数组
const getItemImgUrl = (blocks) => {
  for (const blocksElement of blocks) {
    if (blocksElement.type.indexOf("Recommended") != -1) {
      var currentItemList = [];
      for (const items of blocksElement.items) {
        const itemImgUrl = `https://game.gtimg.cn/images/lol/act/img/item/${items.id}.png`;
        currentItemList.push(itemImgUrl);
      }
      skillsAndItems.value.push(currentItemList);
    }
  }
};
// 获取技能图片链接数组
const getSkillsImgUrl = (skillsImg, skills) => {
  let skillsList = [];

  for (let i = 0; i < skillsImg.length; i++) {
    const skillImgUrl = `https://game.gtimg.cn/images/lol/act/img/spell/${skillsImg[i]}`;
    skillsList.push([skillImgUrl, skills[i]]);
  }
  skillsAndItems.value.push(skillsList);
};

// 获取图片地址
const getImaUrl = (imgId) => {
  return require(`../../assets/runes/${imgId}.png`);
};
// 获取位置信息
const getPosition = (pos) => {
  switch (pos) {
    case "middle":
      return "中单";
    case "top":
      return "上单";
    case "support":
      return "辅助";
    case "jungle":
      return "打野";
    case "bottom":
      return "射手";
    case "aram":
      return "极地";
  }
};
// 通过英雄ID获取部分信息
const mapChamp = (champId) => {
  currentChampImgUrl.value = `https://game.gtimg.cn/images/lol/act/img/champion/${champDict[champId].alias}.png`;
  currentChampName.value = champDict[champId].label;
  currentChampAlias.value = champDict[champId].alias;
};
// 应用符文
const applyRune = async (data) => {
  let tempData = JSON.parse(JSON.stringify(data));
  tempData.name = mapNameFromUrl[data.alias].name + " By Frank";
  const isApplySuccess = await applyRunePage(
    credentials,
    JSON.parse(JSON.stringify(tempData))
  );

  if (isApplySuccess) {
    message.success("符文配置成功");
  } else {
    message.error("符文配置失败, 按Ctrl+R 再试试");
  }
};

// 上一页
const pageBack = () => {
  if (pageStart != 0 && pageEnd != runeDataList.length) {
    pageStart = pageStart - 4;
    pageEnd = pageEnd - 4;
    runeDataListFor.value = runeDataList.slice(pageStart, pageEnd);
  } else if (pageEnd == runeDataList.length) {
    pageEnd = pageStart;
    pageStart = pageStart - 4;
    runeDataListFor.value = runeDataList.slice(pageStart, pageEnd);
  } else {
    message.warning("当前是首页哦!");
  }
};
// 下一页
const pageNext = () => {
  const dataListLen = runeDataList.length;
  if (pageEnd + 4 < dataListLen) {
    pageStart = pageEnd;
    pageEnd = pageEnd + 4;
    runeDataListFor.value = runeDataList.slice(pageStart, pageEnd);
  } else if (pageEnd < dataListLen) {
    pageStart = pageEnd;
    pageEnd = dataListLen;
    runeDataListFor.value = runeDataList.slice(pageStart, pageEnd);
  } else {
    message.warning("已经是最后一页咯!");
  }
};

// 设置自动配置符文
const setAutoRune = () => {
  setAutoRuneFromChamp(credentials, currentChamp.value);
  isAutoRune.value = "auto";
};
// 删除自动配置符文
const deleteAutoRune = () => {
  if (appConfig.has(`autoRune.${currentChamp.value}`)) {
    appConfig.delete(`autoRune.${currentChamp.value}`);
    isAutoRune.value = 0;
  }
};
</script>

<style scoped>
.n-card {
  margin: 15px;
  border-radius: 10px;
  width: auto;
}

.n-space {
  align-items: center;
}

.runImgPrimary {
  width: 50px;
  height: 50px;
}

.runImg {
  width: 30px;
  height: 30px;
}

.runImgseSondary {
  width: 25px;
  height: 25px;
  margin-bottom: -7px;
}

.n-card > .n-card__content > .runeCard {
  padding: 0 !important;
}

.buttonSwitch {
  margin-top: 5px;
  margin-left: -5px;
}

.bottomTip {
  margin-bottom: 0px;
  height: 80px;
  padding-top: 10px;
  padding-left: 1px;
}

.itemImg {
  width: 35px;
  height: 35px;
  border-radius: 4px;
  position: absolute;
}

.skillDiv {
  position: relative;
}

.skillText {
  width: 16px;
  height: 16px;
  position: absolute;
  top: 19px;
  left: 19px;
  background: rgba(32, 45, 55, 0.9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  white-space: nowrap;
  color: rgb(0, 215, 176) !important;
  font-size: 11px !important;
}

.itemsTotal {
  float: right;
  position: absolute;
  right: 4px;
  bottom: -2px;
  color: #9aa4af;
}

.slide-in-bottom {
  -webkit-animation: slide-in-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    both;
  animation: slide-in-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes slide-in-bottom {
  0% {
    -webkit-transform: translateY(1000px);
    transform: translateY(1000px);
    opacity: 0;
  }
  100% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

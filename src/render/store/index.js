import { defineStore } from 'pinia'

// useStore 可以是 useUser、useCart 之类的任何东西
// 第一个参数是应用程序中 store 的唯一 id
export const useStore = defineStore('app', {
  state: () => {
    return {
      pageCount: 1
    }
  },
  actions: {
    pageIncrease() {
      this.pageCount += 1
      // return to main home page (=1)
      if (this.pageCount > 2) {
        this.pageReset(1)
      }
    },
    pageReset(count) {
      this.pageCount = count
    },
  }
})


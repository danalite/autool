import { defineStore } from 'pinia'

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


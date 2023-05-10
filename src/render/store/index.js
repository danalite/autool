import { acceptHMRUpdate, defineStore } from 'pinia'
import { traverse } from '@/utils/render/components/common'

export const useStore = defineStore('app', {
  state: () => {
    return {
      pageCount: 1,
      activeSession: null,
      returnValue: {}
    }
  },
  actions: {
    pageIncrease() {
      this.pageCount += 1
      // return to main home page (count=1)
      if (this.pageCount > 2) {
        this.pageReset(1)
      }
    },
    pageReset(count) {
      this.pageCount = count
    },

    getCurrentSession() {
      return this.activeSession
    },

    getReturnValue() {
      return this.returnValue
    },

    clearCurrentSession() {
      if (this.activeSession) {
        this.activeSession.destroy();
      }
      this.activeSession = null
    },

    initializeSession(message, nRef) {
      this.returnValue = {}
      // Object.keys(this.returnValue).forEach((key) => {
      //   delete this.returnValue[key];
      // });

      traverse(message.content, (key, value) => {
        if (key == "key") {
          this.returnValue[value] = null
        }
      });

      if (Object.keys(this.returnValue).length > 0) {
        this.activeSession = nRef
      }
    },

    setValue(key, value) {
      this.returnValue[key] = value
    }
  }
})


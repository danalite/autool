import { defineStore } from 'pinia'
import { traverse } from '@/utils/render/components/common'
import { reactive } from 'vue'

export const useStore = defineStore('app', {
  state: () => {
    return {
      pageCount: 1,
      activeSessions: [],
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

    hasSession(session) {
      return this.activeSessions.some((n) => n.session === session)
    },

    getSession(session) {
      return this.activeSessions.find((n) => n.session === session).nRef
    },

    getReturnValue(session) {
      return this.activeSessions.find((n) => n.session === session).returnValue
    },

    clearSession(session) {
      const v = this.activeSessions.find((n) => n.session === session)
      try {
        v.nRef.destroy()
      } catch (error) {
        console.log("Err: nRed.destroy()", error)
      }
      this.activeSessions = this.activeSessions.filter((n) => n.session !== session)
    },

    initializeSession(session, message, nRef) {
      const returnValue = reactive({})
      traverse(message.content, (key, value) => {
        if (key == "key") {
          returnValue[value] = null
        }
      });

      this.activeSessions.push({
        session: session,
        returnValue: returnValue,
        nRef: nRef
      })
    },

    setValue(session, key, value) {
      this.activeSessions.find((n) => n.session === session).returnValue[key] = value
    }
  }
})


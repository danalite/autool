import mitt from 'mitt'

const eventBus = {}
const emitter = mitt()

eventBus.on = emitter.on
eventBus.off = emitter.off
eventBus.emit = emitter.emit

export default eventBus
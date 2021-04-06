import { CorePlugin, Events, Log, version } from '@clappr/core'

export default class TVsKeyMappingPlugin extends CorePlugin {
  get name() { return 'tvs_key_mapping' }

  get supportedVersion() { return { min: version } }

  constructor(core) {
    super(core)
    this.start = this.start.bind(this)

    this._deviceName = this.options.tvsKeyMapping && this.options.tvsKeyMapping.deviceToMap

    this._deviceName
      ? this.start(this._deviceName)
      : Log.warn(this.name, 'tvsKeyMapping.deviceToMap was not configured. Call the start method with a valid name to activate the plugin.')
  }

  start(device) {
    this._deviceName = device
  }
}

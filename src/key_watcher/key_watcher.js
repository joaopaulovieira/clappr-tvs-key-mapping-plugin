import { CorePlugin, version } from '@clappr/core'

export default class TVsKeyMappingPlugin extends CorePlugin {
  get name() { return 'tvs_key_mapping' }

  get supportedVersion() { return { min: version } }

  constructor(core) {
    super(core)
    this._deviceName = this.options.tvsKeyMapping && this.options.tvsKeyMapping.deviceToMap
  }
}

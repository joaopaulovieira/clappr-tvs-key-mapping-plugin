import { CorePlugin, version } from '@clappr/core'

export default class TVsKeyMappingPlugin extends CorePlugin {
  get name() { return 'tvs_key_mapping' }

  get supportedVersion() { return { min: version } }
}

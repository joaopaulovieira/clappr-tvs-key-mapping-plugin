import { Core, Container, Events, Playback, version } from '@clappr/core'
import TVsKeyMappingPlugin from './key_watcher'

const setupTest = (options = {}, fullSetup = false) => {
  const core = new Core(options)
  const plugin = new TVsKeyMappingPlugin(core)
  core.addPlugin(plugin)

  const response = { core, plugin }
  fullSetup && (response.container = new Container({ playerId: 1, playback: new Playback({}) }))

  return response
}

describe('TVsKeyMappingPlugin', function() {
  describe('constructor', () => {
    test('saves options.tvsKeyMapping.deviceToMap reference internally', () => {
      const { plugin } = setupTest({ tvsKeyMapping: { deviceToMap: 'xpto' } })

      expect(plugin._deviceName).toEqual('xpto')
    })
  })

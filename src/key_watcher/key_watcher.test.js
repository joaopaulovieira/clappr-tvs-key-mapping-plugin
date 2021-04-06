/* eslint-disable no-console */

import mockConsole from 'jest-mock-console'

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

const LOG_WARN_HEAD_MESSAGE = '%c[warn][tvs_key_mapping]'
const LOG_WARN_STYLE = 'color: #ff8000;font-weight: bold; font-size: 13px;'

describe('TVsKeyMappingPlugin', function() {
  beforeEach(() => {
    this.restoreConsole = mockConsole()

    jest.clearAllMocks()
    const response = setupTest({}, true)
    this.core = response.core
    this.container = response.container
    this.core.activeContainer = this.container
    this.playback = this.container.playback
    this.plugin = response.plugin
  })

  describe('constructor', () => {
    test('saves options.tvsKeyMapping.deviceToMap reference internally', () => {
      const { plugin } = setupTest({ tvsKeyMapping: { deviceToMap: 'xpto' } })

      expect(plugin._deviceName).toEqual('xpto')
    })

    test('calls start method with internal options.tvsKeyMapping.deviceToMap reference if exists', () => {
      jest.spyOn(TVsKeyMappingPlugin.prototype, 'start')
      setupTest({ tvsKeyMapping: { deviceToMap: 'xpto' } })

      expect(TVsKeyMappingPlugin.prototype.start).toHaveBeenCalledWith('xpto')
    })

    test('logs a warn message if options.tvsKeyMapping.deviceToMap is not configured', () => {
      expect(console.log).toHaveBeenCalledWith(
        LOG_WARN_HEAD_MESSAGE,
        LOG_WARN_STYLE,
        'tvsKeyMapping.deviceToMap was not configured. Call the start method with a valid name to activate the plugin.',
      )
    })
  })
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

const LOG_INFO_HEAD_MESSAGE = '%c[info][tvs_key_mapping]'
const LOG_WARN_HEAD_MESSAGE = '%c[warn][tvs_key_mapping]'
const LOG_INFO_STYLE = 'color: #006600;font-weight: bold; font-size: 13px;'
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
  afterEach(() => this.restoreConsole())

  test('is loaded on core plugins array', () => {
    expect(this.core.getPlugin(this.plugin.name).name).toEqual('tvs_key_mapping')
  })

  test('is compatible with the latest Clappr core version', () => {
    expect(this.core.getPlugin(this.plugin.name).supportedVersion).toEqual({ min: version })
  })

  describe('constructor', () => {
    test('register custom event to trigger on core scope', () => {
      expect(Events.Custom.CORE_SMART_TV_KEY_PRESSED).toBeDefined()
    })

    test('register custom event to trigger on container scope', () => {
      expect(Events.Custom.CONTAINER_SMART_TV_KEY_PRESSED).toBeDefined()
    })

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

  describe('start method', () => {
    test('logs a warn message if device name is not received', () => {
      this.plugin.start()

      expect(console.log).toHaveBeenCalledWith(
        LOG_WARN_HEAD_MESSAGE,
        LOG_WARN_STYLE,
        'No one device name was received. The plugin will not fire events as expected.',
      )
    })

    test('logs a warn message if receives a invalid device name', () => {
      this.plugin.start('xpto')

      expect(console.log).toHaveBeenCalledWith(
        LOG_WARN_HEAD_MESSAGE,
        LOG_WARN_STYLE,
        'The device name is not valid. The plugin will not fire events as expected.',
      )
    })

    test('updates options.tvsKeyMapping.deviceToMap internal reference with received value', () => {
      const { plugin } = setupTest({ tvsKeyMapping: { deviceToMap: 'xpto' } })
      plugin.start('browser')

      expect(plugin._deviceName).toEqual('browser')
    })

    test('adds _triggerKeyDownEvents method as a callback of keydown event listener on the document', () => {
      jest.spyOn(this.plugin, '_triggerKeyDownEvents')
      this.plugin.start('browser')
      document.dispatchEvent(new Event('keydown'))

      expect(this.plugin._triggerKeyDownEvents).toHaveBeenCalledTimes(1)
    })
  })

  describe('_triggerKeyDownEvents method', () => {
    test('calls _getKeyNameFromEvent method', () => {
      jest.spyOn(this.plugin, '_getKeyNameFromEvent')
      this.plugin._triggerKeyDownEvents(new Event('keydown'))

      expect(this.plugin._getKeyNameFromEvent).toHaveBeenCalledTimes(1)
    })

    test('logs a warn message if _getKeyNameFromEvent method returns one invalid key name', () => {
      jest.spyOn(this.plugin, '_getKeyNameFromEvent').mockReturnValueOnce(undefined)
      this.plugin._triggerKeyDownEvents(new Event('keydown'))

      expect(console.log).toHaveBeenCalledWith(
        LOG_WARN_HEAD_MESSAGE,
        LOG_WARN_STYLE,
        'The key code is not mapped. The plugin will not fire events as expected.',
      )
    })

    test('triggers CORE_SMART_TV_KEY_PRESSED custom event at core scope', () => {
      const { plugin } = setupTest({ tvsKeyMapping: { deviceToMap: 'browser' } })
      const cb = jest.fn()
      plugin.listenToOnce(plugin.core, Events.Custom.CORE_SMART_TV_KEY_PRESSED, cb)
      plugin._triggerKeyDownEvents(new KeyboardEvent('keydown', { keyCode: 13 }))

      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenCalledWith('ENTER')
    })

    test('triggers CONTAINER_SMART_TV_KEY_PRESSED custom event at container scope', () => {
      const { plugin, container } = setupTest({ tvsKeyMapping: { deviceToMap: 'browser' } }, true)
      plugin.core.activeContainer = container
      const cb = jest.fn()
      plugin.listenToOnce(container, Events.Custom.CONTAINER_SMART_TV_KEY_PRESSED, cb)
      plugin._triggerKeyDownEvents(new KeyboardEvent('keydown', { keyCode: 13 }))

      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenCalledWith('ENTER')
    })

    test('dont\'t trigger CONTAINER_SMART_TV_KEY_PRESSED custom event if core.activeContainer doesn\'t exists', () => {
      const { plugin, container } = setupTest({ tvsKeyMapping: { deviceToMap: 'browser' } }, true)
      const cb = jest.fn()
      plugin.listenToOnce(container, Events.Custom.CONTAINER_SMART_TV_KEY_PRESSED, cb)
      plugin._triggerKeyDownEvents(new KeyboardEvent('keydown', { keyCode: 13 }))

      expect(cb).not.toHaveBeenCalled()
    })
  })

  describe('_getKeyNameFromEvent method', () => {
    test('returns one key name accordingly the received keyboard event if is a mapped device', () => {
      const receivedKeyName1 = this.plugin._getKeyNameFromEvent(new KeyboardEvent('keydown', { keyCode: 13 }))

      expect(receivedKeyName1).toBeUndefined()

      const { plugin: plugin1 } = setupTest({ tvsKeyMapping: { deviceToMap: 'browser' } })
      const receivedKeyName2 = plugin1._getKeyNameFromEvent(new KeyboardEvent('keydown', { keyCode: 13 }))

      expect(receivedKeyName2).toEqual('ENTER')

      const { plugin: plugin2 } = setupTest({ tvsKeyMapping: { deviceToMap: 'browser' } })
      const receivedKeyName3 = plugin2._getKeyNameFromEvent(new KeyboardEvent('keydown', { keyCode: 999 }))

      expect(receivedKeyName3).toBeUndefined()
    })
  })

  describe('stop method', () => {
    test('removes keydown event listener from document', () => {
      jest.spyOn(this.plugin, '_triggerKeyDownEvents')
      this.plugin.start('browser')
      document.dispatchEvent(new Event('keydown'))

      expect(this.plugin._triggerKeyDownEvents).toHaveBeenCalledTimes(1)

      this.plugin.stop()
      document.dispatchEvent(new Event('keydown'))

      expect(this.plugin._triggerKeyDownEvents).toHaveBeenCalledTimes(1)
    })
  })

  describe('enableLog method', () => {
    test('logs a warn message if _deviceName is undefined', () => {
      this.plugin.enableLog()

      expect(console.log).toHaveBeenCalledWith(
        LOG_WARN_HEAD_MESSAGE,
        LOG_WARN_STYLE,
        'No one device name was configured. Logging is not enabled.',
      )
    })

    test('adds _onPressedKey method as a callback of keydown event listener on the document', () => {
      const { plugin } = setupTest({ tvsKeyMapping: { deviceToMap: 'browser' } })
      jest.spyOn(plugin, '_onPressedKey')
      plugin.enableLog()
      document.dispatchEvent(new Event('keydown'))

      expect(plugin._onPressedKey).toHaveBeenCalledTimes(1)
    })
  })

  describe('_onPressedKey method', () => {
    test('logs a info message containing the key code and key name of received keyboard event', () => {
      const { plugin: plugin1 } = setupTest({ tvsKeyMapping: { deviceToMap: 'browser' } })
      plugin1._onPressedKey(new KeyboardEvent('keydown', { keyCode: 13 }))

      expect(console.log).toHaveBeenCalledWith(
        LOG_INFO_HEAD_MESSAGE,
        LOG_INFO_STYLE,
        'The key pressed has the code 13 and is mapped to the ENTER value.',
      )

      const { plugin: plugin2 } = setupTest({ tvsKeyMapping: { deviceToMap: 'browser' } })
      plugin2._onPressedKey(new KeyboardEvent('keydown', { keyCode: 999 }))

      expect(console.log).toHaveBeenCalledWith(
        LOG_INFO_HEAD_MESSAGE,
        LOG_INFO_STYLE,
        'The key pressed has the code 999 and is mapped to the undefined value.',
      )
    })
  })

  describe('disableLog method', () => {
    test('removes keydown event listener from document', () => {
      const { plugin } = setupTest({ tvsKeyMapping: { deviceToMap: 'browser' } })
      jest.spyOn(plugin, '_onPressedKey')
      plugin.enableLog()
      document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13 }))

      expect(plugin._onPressedKey).toHaveBeenCalledTimes(1)

      plugin.disableLog()
      document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13 }))

      expect(plugin._onPressedKey).toHaveBeenCalledTimes(1)
    })
  })

  describe('destroy method', () => {
    test('is called when Core is destroyed too', () => {
      jest.spyOn(this.plugin, 'destroy')
      this.core.destroy()

      expect(this.plugin.destroy).toHaveBeenCalled()
    })

    test('calls stop method', () => {
      jest.spyOn(this.plugin, 'stop')
      this.plugin.destroy()

      expect(this.plugin.stop).toHaveBeenCalledTimes(1)
    })

    test('calls disableLog method', () => {
      jest.spyOn(this.plugin, 'disableLog')
      this.plugin.destroy()

      expect(this.plugin.disableLog).toHaveBeenCalledTimes(1)
    })
  })
})

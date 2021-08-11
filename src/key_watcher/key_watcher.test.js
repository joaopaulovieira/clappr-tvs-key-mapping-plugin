/* eslint-disable no-console */

import mockConsole from 'jest-mock-console'

import { Core, Container, Events, Playback, version } from '@clappr/core'
import TVsKeyMappingPlugin from './key_watcher'

const setupTest = (options = {}) => {
  const playback = new Playback(options)
  options.playback = playback
  const container = new Container(options)
  const core = new Core(options)
  const plugin = new TVsKeyMappingPlugin(core)

  core.addPlugin(plugin)
  core.activeContainer = container

  return { plugin, core, container, playback }
}

const LOG_INFO_HEAD_MESSAGE = '%c[info][tvs_key_mapping]'
const LOG_WARN_HEAD_MESSAGE = '%c[warn][tvs_key_mapping]'
const LOG_INFO_STYLE = 'color: #006600;font-weight: bold; font-size: 13px;'
const LOG_WARN_STYLE = 'color: #ff8000;font-weight: bold; font-size: 13px;'

describe('TVsKeyMappingPlugin', function() {
  beforeEach(() => {
    this.restoreConsole = mockConsole()
    jest.clearAllMocks()
  })

  afterEach(() => this.restoreConsole())

  test('register custom event to trigger on core scope', () => {
    expect(Events.Custom.CORE_SMART_TV_KEY_PRESSED).toBeDefined()
  })

  test('register custom event to trigger on container scope', () => {
    expect(Events.Custom.CONTAINER_SMART_TV_KEY_PRESSED).toBeDefined()
  })

  test('is loaded on core plugins array', () => {
    const { plugin, core } = setupTest()

    expect(core.getPlugin(plugin.name).name).toEqual('tvs_key_mapping')
  })

  test('is compatible with the latest Clappr core version', () => {
    const { plugin, core } = setupTest()

    expect(core.getPlugin(plugin.name).supportedVersion).toEqual({ min: version })
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
      setupTest()

      expect(console.log).toHaveBeenCalledWith(
        LOG_WARN_HEAD_MESSAGE,
        LOG_WARN_STYLE,
        'tvsKeyMapping.deviceToMap was not configured. Call the start method with a valid name to activate the plugin.',
      )
    })
  })

  describe('start method', () => {
    test('logs a warn message if device name is not received', () => {
      const { plugin } = setupTest()

      plugin.start()

      expect(console.log).toHaveBeenCalledWith(
        LOG_WARN_HEAD_MESSAGE,
        LOG_WARN_STYLE,
        'No one device name was received. The plugin will not fire events as expected.',
      )
    })

    test('logs a warn message if receives a invalid device name', () => {
      const { plugin } = setupTest()

      plugin.start('xpto')

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
      const { plugin } = setupTest()
      jest.spyOn(plugin, '_triggerKeyDownEvents')

      plugin.start('browser')
      document.dispatchEvent(new Event('keydown'))

      expect(plugin._triggerKeyDownEvents).toHaveBeenCalledTimes(1)
    })
  })

  describe('_triggerKeyDownEvents method', () => {
    test('calls _getKeyNameFromEvent method', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, '_getKeyNameFromEvent')

      plugin._triggerKeyDownEvents(new Event('keydown'))

      expect(plugin._getKeyNameFromEvent).toHaveBeenCalledTimes(1)
    })

    test('logs a warn message if _getKeyNameFromEvent method returns one invalid key name', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, '_getKeyNameFromEvent').mockReturnValueOnce(undefined)

      plugin._triggerKeyDownEvents(new Event('keydown'))

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
      const keyEvent = new KeyboardEvent('keydown', { keyCode: 13 })

      plugin._triggerKeyDownEvents(keyEvent)

      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenCalledWith('ENTER', { keyName: 'ENTER', keyEvent })
    })

    test('triggers CONTAINER_SMART_TV_KEY_PRESSED custom event at container scope', () => {
      const { plugin, container } = setupTest({ tvsKeyMapping: { deviceToMap: 'browser' } })
      const cb = jest.fn()
      plugin.listenToOnce(container, Events.Custom.CONTAINER_SMART_TV_KEY_PRESSED, cb)
      const keyEvent = new KeyboardEvent('keydown', { keyCode: 13 })

      plugin._triggerKeyDownEvents(keyEvent)

      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenCalledWith('ENTER', { keyName: 'ENTER', keyEvent })
    })

    test('dont\'t trigger CONTAINER_SMART_TV_KEY_PRESSED custom event if core.activeContainer doesn\'t exists', () => {
      const { plugin, core, container } = setupTest({ tvsKeyMapping: { deviceToMap: 'browser' } })
      core.activeContainer = null
      const cb = jest.fn()
      plugin.listenToOnce(container, Events.Custom.CONTAINER_SMART_TV_KEY_PRESSED, cb)
      const keyEvent = new KeyboardEvent('keydown', { keyCode: 13 })

      plugin._triggerKeyDownEvents(keyEvent)

      expect(cb).not.toHaveBeenCalled()
    })
  })

  describe('_getKeyNameFromEvent method', () => {
    test('returns one key name accordingly the received keyboard event if is a mapped device', () => {
      const { plugin } = setupTest()
      const receivedKeyName1 = plugin._getKeyNameFromEvent(new KeyboardEvent('keydown', { keyCode: 13 }))

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
      const { plugin } = setupTest()
      jest.spyOn(plugin, '_triggerKeyDownEvents')
      plugin.start('browser')
      document.dispatchEvent(new Event('keydown'))

      expect(plugin._triggerKeyDownEvents).toHaveBeenCalledTimes(1)

      plugin.stop()
      document.dispatchEvent(new Event('keydown'))

      expect(plugin._triggerKeyDownEvents).toHaveBeenCalledTimes(1)
    })
  })

  describe('enableLog method', () => {
    test('logs a warn message if _deviceName is undefined', () => {
      const { plugin } = setupTest()

      plugin.enableLog()

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
      const { plugin, core } = setupTest()
      jest.spyOn(plugin, 'destroy')

      core.destroy()

      expect(plugin.destroy).toHaveBeenCalled()
    })

    test('calls stop method', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'stop')

      plugin.destroy()

      expect(plugin.stop).toHaveBeenCalledTimes(1)
    })

    test('calls disableLog method', () => {
      const { plugin } = setupTest()
      jest.spyOn(plugin, 'disableLog')

      plugin.destroy()

      expect(plugin.disableLog).toHaveBeenCalledTimes(1)
    })
  })
})

<!-- [![](https://data.jsdelivr.com/v1/package/npm/clappr-tvs-key-mapping-plugin/badge)](https://www.jsdelivr.com/package/npm/clappr-tvs-key-mapping-plugin)
[![](https://img.shields.io/npm/v/clappr-tvs-key-mapping-plugin.svg?style=flat-square)](https://npmjs.org/package/clappr-tvs-key-mapping-plugin)
[![](https://img.shields.io/npm/dt/clappr-tvs-key-mapping-plugin.svg?style=flat-square)](https://npmjs.org/package/clappr-tvs-key-mapping-plugin)
[![npm bundle size](https://img.shields.io/bundlephobia/min/clappr-tvs-key-mapping-plugin?style=flat-square)](https://bundlephobia.com/result?p=clappr-tvs-key-mapping-plugin) -->
![Coveralls github](https://img.shields.io/coveralls/github/joaopaulovieira/clappr-tvs-key-mapping-plugin?style=flat-square)
![Travis (.com)](https://img.shields.io/travis/com/joaopaulovieira/clappr-tvs-key-mapping-plugin?style=flat-square)
[![](https://img.shields.io/github/license/joaopaulovieira/clappr-context-menu-plugin?style=flat-square)](https://github.com/joaopaulovieira/clappr-context-menu-plugin/blob/master/LICENSE)

<h1 align=center>Clappr TVs key mapping plugin</h1>

## Table of Contents
- [Features](https://github.com/joaopaulovieira/clappr-tvs-key-mapping-plugin#Features)
- [Usage](https://github.com/joaopaulovieira/clappr-tvs-key-mapping-plugin#Usage)
- [Configuration](https://github.com/joaopaulovieira/clappr-tvs-key-mapping-plugin#Configuration)
- [API Documentation](https://github.com/joaopaulovieira/clappr-tvs-key-mapping-plugin#API-Documentation)
- [Development](https://github.com/joaopaulovieira/clappr-tvs-key-mapping-plugin#Development)

## Features
### :mage: One plugin to rule them all (remote controls)
Each smart TV device has your own remote control key code. With this plugin, you can guarantee that the wanted action for one button is consistent with all mapped devices. 

### :clappr: Clappr events FTW!
When the key of the mapped device is pressed, the plugin triggers one Clappr event with the key name on `core`(`CORE_SMART_TV_KEY_PRESSED`) and `container`(`CONTAINER_SMART_TV_KEY_PRESSED`) scope. This flow allows you to listen to one of those events a do what you want based on the returned key name.

### :mag: `console.log` for the rescue
Enable/disable log dynamically to check the key code and key name of each remote control key (and find out if the key is not mapped too!).


## Usage
You can use it from JSDelivr:
```
https://cdn.jsdelivr.net/npm/clappr-tvs-key-mapping-plugin@latest/dist/clappr-tvs-key-mapping-plugin.min.js
```
or as an npm package:
```properties
# Using yarn
yarn add @joaopaulo.vieira/clappr-tvs-key-mapping-plugin

# Using npm
npm i @joaopaulo.vieira/clappr-tvs-key-mapping-plugin
```

Then just add the `Watcher` into the list of plugins of your player instance and set the device name to watch on [tvsKeyMapping.deviceToMap](https://github.com/joaopaulovieira/clappr-tvs-key-mapping-plugin#devicetomap-string) config:
```javascript
var player = new Clappr.Player({
  source: 'http://your.video/here.mp4',
  plugins: [TVsKeyMappingPlugin.Watcher],
  tvsKeyMapping: { deviceToMap: 'browser' },
});
```

## Configuration
The options for the plugin go in the `tvsKeyMapping` property as shown below:
```javascript
var player = new Clappr.Player({
  source: 'http://your.video/here.mp4',
  plugins: [TVsKeyMappingPlugin.Watcher],
  tvsKeyMapping: {
    deviceToMap: 'browser',
  },
});
```

### `deviceToMap {String}`
This config is mandatory for the plugin. The name needs to be one of the currently mapped devices. The current mapped devices names are below:

| Name | Device |
|------|--------|
| `browser` | This option is for test the plugin on a desktop device in any web browser. |
|`panasonic`| Panasonic smart TVs. |

## API Documentation

### Plugin API
| method | arguments | description |
|--------|:---------:|-------------|
| `plugin.start` | `device` | Adds a listener for remote control `keydown` events of the mapped device to send the key name on the Clappr events. |
| `plugin.stop` | | Removes listener for remote control `keydown` events. |
| `plugin.enableLog` |  | Adds a listener for remote control `keydown` events of the mapped device to log remote control key data. |
| `plugin.disableLog` |  | Removes listener for remote control `keydown` events that logging remote control key data. |

## Development
Install dependencies: `npm install`

Run: `npm start`

Test: `npm test`

Lint: `npm run lint`

Build: `npm run build`

Minified version: `npm run release`

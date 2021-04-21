/* eslint-disable */
Clappr.Log.setLevel(Clappr.Log.LEVEL_INFO)

const onReadyCallback = function() {
  this.core.listenTo(this.core, Clappr.Events.Custom.CORE_SMART_TV_KEY_PRESSED, keyName => Clappr.Log.info('keyName', keyName))
}

var player = new Clappr.Player({
  source: 'http://clappr.io/highline.mp4',
  height: '320px',
  width: '640px',
  tvsKeyMapping: { deviceToMap: 'browser' },
  playback: { controls: true },
  plugins: [window.TVsKeyMappingPlugin.Watcher],
  events: { onReady: onReadyCallback },
});

player.attachTo(document.body);

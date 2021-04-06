Clappr.Log.setLevel(Clappr.Log.LEVEL_INFO)

const onReadyCallback = function() {
  this.core.listenTo(this.core, Clappr.Events.Custom.CORE_SMART_TV_KEY_PRESSED, keyName => Clappr.Log.info('keyName', keyName))
}

const player = new Clappr.Player({
  height: '100%',
  width: '100%',
  source: 'http://clappr.io/highline.mp4',
  poster: 'http://clappr.io/poster.png',
  playback: { controls: true },
  tvsKeyMapping: { deviceToMap: 'browser' },
  plugins: [window.TVsKeyMappingPlugin.Watcher],
  events: { onReady: onReadyCallback },
})

player.attachTo(document.body)

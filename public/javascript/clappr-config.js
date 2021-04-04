const player = new Clappr.Player({
  height: '100%',
  width: '100%',
  source: 'http://clappr.io/highline.mp4',
  poster: 'http://clappr.io/poster.png',
  playback: { controls: true },
  plugins: [window.TVsKeyMappingPlugin.Watcher],
})

player.attachTo(document.body)

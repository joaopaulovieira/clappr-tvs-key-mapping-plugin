/* eslint-disable */
Clappr.Log.setLevel(Clappr.Log.LEVEL_INFO)

var onReadyCallback = function() {
  var _hideTimeout;

  this.core.listenTo(this.core, Clappr.Events.Custom.CORE_SMART_TV_KEY_PRESSED, function(_, data) {
    Clappr.Log.info('keyName', data.keyName);
    clearTimeout(_hideTimeout);
    document.querySelector('.snackbar').innerText = 'The key pressed has the code ' + data.keyEvent.keyCode + ' and is mapped to the "' + data.keyName + '" value.';
    document.querySelector('.snackbar').className += ' show';
    _hideTimeout = setTimeout(function() { document.querySelector('.snackbar').className = 'snackbar' }, 3000);
  });
};

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

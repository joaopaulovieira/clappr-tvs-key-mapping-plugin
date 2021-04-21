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

var searchParams;
window.URLSearchParams && (searchParams = new window.URLSearchParams(window.location.search));

var player = new Clappr.Player({
  source: searchParams && searchParams.get('source') || 'http://clappr.io/highline.mp4',
  height: searchParams && searchParams.get('height') || '320px',
  width: searchParams && searchParams.get('width') || '640px',
  tvsKeyMapping: { deviceToMap: searchParams && searchParams.get('deviceToMap') || 'browser' },
  playback: { controls: true },
  plugins: [window.TVsKeyMappingPlugin.Watcher],
  events: { onReady: onReadyCallback },
});

player.attachTo(document.body);

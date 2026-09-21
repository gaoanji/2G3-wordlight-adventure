/* Predecoded, trimmed effects; background music keeps its native audio path. */
(() => {
  const files={button:'assets/sounds/button.wav',badge:'assets/sounds/badge.wav'};
  const levels={button:.45,badge:.65},buffers={},pools={},active=new Set(),lastPress=new WeakMap();
  let context;
  try{const AudioCtx=window.AudioContext||window.webkitAudioContext;if(AudioCtx)context=new AudioCtx({latencyHint:'interactive'})}catch{}
  for(const [name,url] of Object.entries(files)){
    pools[name]=Array.from({length:name==='button'?5:2},()=>{const a=new Audio(url);a.preload='auto';a.volume=levels[name];a.load();return a});
    if(context)fetch(url).then(r=>{if(!r.ok)throw new Error('audio unavailable');return r.arrayBuffer()}).then(bytes=>context.decodeAudioData(bytes)).then(buffer=>{buffers[name]=buffer}).catch(()=>{});
  }
  function resume(){if(context&&context.state!=='running')context.resume().catch(()=>{})}
  function stop(){for(const source of active){try{source.stop()}catch{}}active.clear();for(const list of Object.values(pools))for(const a of list){a.pause();a.currentTime=0}}
  function play(name){
    if(uiMuted||document.hidden)return;
    resume();
    if(context&&buffers[name]&&context.state!=='closed'){
      const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffers[name];gain.gain.value=levels[name];source.connect(gain);gain.connect(context.destination);active.add(source);
      source.onended=()=>{active.delete(source);source.disconnect();gain.disconnect()};
      source.start(context.currentTime);return;
    }
    // Already-preloaded fallback, without waiting for a fetch or animation timer.
    const list=pools[name],a=list.find(a=>a.paused||a.ended)||list[0];a.currentTime=0;a.play().catch(()=>{});
  }
  function target(e){const b=e.target instanceof Element?e.target.closest('button,[role="button"],input[type="button"],input[type="submit"]'):null;return b&&!b.disabled&&b.getAttribute('aria-disabled')!=='true'&&!b.closest('[inert]')?b:null}
  document.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;resume();const b=target(e);if(b){lastPress.set(b,performance.now());play('button')}},true);
  document.addEventListener('keydown',e=>{if(e.repeat||!['Enter',' '].includes(e.key))return;resume();const b=target(e);if(b){lastPress.set(b,performance.now());play('button')}},true);
  document.addEventListener('click',e=>{const b=target(e);if(!b)return;const previous=lastPress.get(b);lastPress.delete(b);if(previous!==undefined&&performance.now()-previous<2000)return;play('button')},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
  window.GameEffects={play,stop};
})();

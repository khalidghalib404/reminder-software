// offscreen.js - plays a short beep using Web Audio when requested

let audioCtx = null;
function ensureCtx(){
  if(audioCtx) return audioCtx;
  audioCtx = new (self.AudioContext || self.webkitAudioContext)();
  return audioCtx;
}

function playBeep(){
  try{
    const ctx = ensureCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.001;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampTo(0.2, ctx.currentTime + 0.02);
    g.gain.exponentialRampTo(0.0001, ctx.currentTime + 0.7);
    o.stop(ctx.currentTime + 0.8);
  }catch(e){console.error(e)}
}

chrome.runtime.onMessage.addListener((msg)=>{
  if(msg && msg.type==='play-sound'){
    playBeep();
  }
});

// keep the document alive for a short time
setInterval(()=>{}, 100000);

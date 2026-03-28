// service_worker.js - schedules alarms and shows notifications when reminders are due

chrome.runtime.onInstalled.addListener(()=>{
  chrome.storage.local.get(['tasks'], (res)=>{
    const tasks = res.tasks||[];
    tasks.forEach(scheduleTask);
  });
});

chrome.storage.onChanged.addListener((changes, area)=>{
  if(area!=='local') return;
  if(changes.tasks){
    const tasks = changes.tasks.newValue || [];
    // clear all alarms then reschedule
    chrome.alarms.clearAll(()=>{
      tasks.forEach(scheduleTask);
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm)=>{
  try{
    const id = alarm.name;
    chrome.storage.local.get(['tasks'], (res)=>{
      const tasks = res.tasks||[];
      const t = tasks.find(x=>x.id===id);
      if(!t) return;
      // show notification
      chrome.notifications.create(id, {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: t.title || 'Reminder',
        message: t.details || 'It\'s time',
        priority: 2
      });
      // try to open offscreen document to play sound
      ensureOffscreen().then(()=>{
        chrome.offscreen.postMessage({type:'play-sound', id});
      }).catch(()=>{});
    });
  }catch(e){console.error(e)}
});

function scheduleTask(t){
  if(!t.due) return;
  const when = new Date(t.due).getTime();
  const now = Date.now();
  if(when<=now) return; // past
  chrome.alarms.create(t.id, {when});
}

async function ensureOffscreen(){
  if(await chrome.offscreen.hasDocument()) return;
  const url = 'offscreen.html';
  await chrome.offscreen.createDocument({
    url,
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play reminder sound'
  });
}

// listen for messages from offscreen or popup
chrome.runtime.onMessage.addListener((msg, sender, sendResp)=>{
  if(msg && msg.type==='schedule'){ scheduleTask(msg.task); }
});

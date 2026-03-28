const form = document.getElementById('taskForm');
const titleEl = document.getElementById('title');
const detailsEl = document.getElementById('details');
const dueEl = document.getElementById('due');
const tasksEl = document.getElementById('tasks');
const clearAllBtn = document.getElementById('clearAll');

let tasks = [];

function save() {
  chrome.storage.local.set({tasks});
}

function load() {
  chrome.storage.local.get(['tasks'], (res) => {
    tasks = res.tasks || [];
    render();
  });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

function addTask(t) {
  tasks.push(t);
  tasks.sort((a,b)=>{ if(!a.due) return 1; if(!b.due) return -1; return new Date(a.due)-new Date(b.due)});
  save();
  render();
}

function removeTask(id, el) {
  // animation
  el.classList.add('removing');
  setTimeout(()=>{
    tasks = tasks.filter(x=>x.id!==id);
    save();
    render();
  }, 260);
}

function render(){
  tasksEl.innerHTML='';
  if(tasks.length===0){
    const p=document.createElement('p');p.style.color='var(--muted)';p.style.textAlign='center';p.textContent='No reminders yet.';tasksEl.appendChild(p);return;
  }
  tasks.forEach(t=>{
    const li=document.createElement('li');li.className='task';
    const h=document.createElement('header');
    const h3=document.createElement('h3');h3.className='title';h3.textContent=t.title;
    const btn=document.createElement('button');btn.className='remove';btn.textContent='Done';
    btn.addEventListener('click',()=>removeTask(t.id, li));
    h.appendChild(h3);h.appendChild(btn);
    li.appendChild(h);
    if(t.details){const p=document.createElement('p');p.className='details';p.textContent=t.details;li.appendChild(p)}
    if(t.due){const s=document.createElement('small');s.className='due';s.textContent='Due: '+new Date(t.due).toLocaleString();li.appendChild(s)}
    tasksEl.appendChild(li);
  })
}

form.addEventListener('submit',(e)=>{
  e.preventDefault();
  const title=titleEl.value.trim();
  if(!title) return;
  const t={id:uid(),title,details:detailsEl.value.trim(),due:dueEl.value||null,created:Date.now()};
  addTask(t);
  form.reset();
});

clearAllBtn.addEventListener('click',()=>{
  if(tasks.length===0) return;
  if(!confirm('Clear all reminders?')) return;
  tasks=[];save();render();
});

load();

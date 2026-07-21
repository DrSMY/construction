/* ============================================================
   Site Punch List — app logic (vanilla JS, IndexedDB)
   ============================================================ */

/* ---------- SVG icon set (Lucide-style, no emoji) ---------- */
const ICONS = {
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  grid:'<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  list:'<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  'check-circle':'<path d="M21.8 10A10 10 0 1 1 17 3.3"/><path d="m9 11 3 3L22 4"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  image:'<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'chevron-left':'<path d="m15 18-6-6 6-6"/>',
  'chevron-right':'<path d="m9 18 6-6-6-6"/>',
  clipboard:'<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  hardhat:'<path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><path d="M14 6a6 6 0 0 1 6 6v3"/>',
  roller:'<rect width="16" height="6" x="2" y="2" rx="2"/><path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7"/><rect width="4" height="6" x="8" y="16" rx="1"/>',
  zap:'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  video:'<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>',
  droplet:'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  wrench:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  alert:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  edit:'<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.4 2.6a1 1 0 0 1 3 3l-9 9-3.5 1 1-3.5z"/>',
  listchecks:'<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  play:'<polygon points="6 3 20 12 6 21 6 3"/>',
  dot:'<circle cx="12" cy="12" r="9"/>',
  more:'<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  cloud:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/>',
  calendar:'<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  'chevron-down':'<path d="m6 9 6 6 6-6"/>',
  layers:'<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  message:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8"/><path d="M8 13h5"/>',
  wind:'<path d="M3 8h12a3 3 0 1 0-3-3"/><path d="M3 12h16a2 2 0 1 1-2 2"/><path d="M3 16h8"/>',
  copy:'<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'
};
function iconSvg(name, attrs=''){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${attrs}>${ICONS[name]||''}</svg>`;
}
function sIco(name){ return `<span class="ico">${iconSvg(name)}</span>`; }
function hydrateIcons(root=document){
  root.querySelectorAll('[data-ico]').forEach(el=>{ el.innerHTML = iconSvg(el.getAttribute('data-ico')); });
}

const TYPE_ICON = {
  'General Construction':'hardhat', 'Painting':'roller', 'Electrical':'zap',
  'Camera':'video', 'Plumbing':'droplet', 'HVAC':'wind', 'Joinery':'layers',
  'Civil Works':'hardhat', 'Others':'wrench'
};
function typeIcon(type){ return TYPE_ICON[type] || 'wrench'; }
function typeClass(type){
  return ['General Construction','Painting','Electrical','Camera','Plumbing','HVAC','Joinery','Civil Works','Others'].includes(type)
    ? 'type-'+type.replace(/\s+/g,'-') : 'type-Others';
}

/* ---------- state ---------- */
let items=[], currentEditId=null, tempBefore=[], tempAfter=[], tempHistory=[];
let viewMode='cards', editStatus='Not Done', editPriority='Medium';
let gallery=[], galleryIdx=0;
let project=null, tempProjectPhotos=[];
let historyBaseline=0;          // # of comments already saved when modal opened
let CURRENT_ROLE=null;          // user's role in the current project
let IS_SUPER=false;             // super admin
let currentProjectId=null;
let myProjectList=[];
function CAP(action){ return can(CURRENT_ROLE, action, IS_SUPER); }

/* ---------- helpers ---------- */
const $=id=>document.getElementById(id);
function uid(){ return 'id_'+Date.now()+'_'+Math.random().toString(36).slice(2,8); }
function esc(s){ return (s||'').toString().replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function slug(s){ return (s||'').replace(/\s+/g,'-'); }
function fileToMedia(file){
  return new Promise(res=>{ const r=new FileReader(); r.onload=()=>res({src:r.result, isVideo:file.type.startsWith('video')}); r.readAsDataURL(file); });
}
function fmtDate(ts){ return ts ? new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}) : ''; }
function fmtDateTime(){ return new Date().toLocaleString(undefined,{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}); }
function statusLabel(status){ return ({'Not Done':'Open','Partially Done':'In Progress','Ready for Inspection':'Ready for Inspection','Completed':'Closed'})[status]||status||'Open'; }
function auditDate(ts){ return ts ? new Date(ts).toLocaleString(undefined,{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}) : ''; }
function actorSnapshot(){
  const user=Auth.user()||{};
  return { by:user.email||'Unknown user', role:IS_SUPER?'super admin':(CURRENT_ROLE||'team member') };
}
function actorName(email){
  const base=(email||'SitePunch user').split('@')[0].replace(/[._-]+/g,' ').trim();
  return base.replace(/\b\w/g,c=>c.toUpperCase())||'SitePunch User';
}
function actorInitials(email){
  const parts=actorName(email).split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0]||'?')+(parts.length>1?(parts.at(-1)[0]||''):'')).toUpperCase();
}
function auditEntry(text,{kind='update',title='',date=Date.now(),by,role,draft=false}={}){
  const actor=actorSnapshot();
  return { id:uid(), date, text, kind, title, by:by||actor.by, role:role||actor.role, draft };
}
function ensureIssueHistory(item){
  item.history=Array.isArray(item.history)?item.history:[];
  if(!item.history.some(h=>h.kind==='created')){
    item.history.push(auditEntry('Issue record created',{kind:'created',title:'Issue created',date:item.createdAt||item.updatedAt||Date.now(),by:item.createdBy||'SitePunch system',role:item.createdByRole||'system'}));
  }
  return item;
}
function auditChanges(before,after){
  if(!before) return [];
  const entries=[];
  const add=(text,kind='update',title='Issue updated')=>entries.push(auditEntry(text,{kind,title}));
  if(before.status!==after.status) add(`Status changed from ${statusLabel(before.status)} to ${statusLabel(after.status)}`,'status','Status updated');
  if(before.priority!==after.priority) add(`Priority changed from ${before.priority||'Unspecified'} to ${after.priority||'Unspecified'}`,'priority','Priority updated');
  if((before.contact||'')!==(after.contact||'')) add(`Responsible contractor changed from ${before.contact||'Unassigned'} to ${after.contact||'Unassigned'}`,'assignment','Assignment updated');
  if((before.expectedDate||'')!==(after.expectedDate||'')) add(`Due date changed from ${before.expectedDate||'Not set'} to ${after.expectedDate||'Not set'}`,'calendar','Due date updated');
  if((before.room||'')!==(after.room||'')) add(`Location changed from ${before.room||'Not set'} to ${after.room||'Not set'}`,'location','Location updated');
  if((before.type||'')!==(after.type||'')) add(`Trade changed from ${before.type||'Not set'} to ${after.type||'Not set'}`,'trade','Trade updated');
  if((before.description||'')!==(after.description||'')) add('Issue description was updated','description','Description updated');
  const beforeOriginal=(before.beforePhotos||[]).length, afterOriginal=(after.beforePhotos||[]).length;
  const beforeProgress=(before.afterPhotos||[]).length, afterProgress=(after.afterPhotos||[]).length;
  if(beforeOriginal!==afterOriginal) add(`Original evidence changed from ${beforeOriginal} to ${afterOriginal} file${afterOriginal===1?'':'s'}`,'photo','Evidence updated');
  if(beforeProgress!==afterProgress) add(`Progress evidence changed from ${beforeProgress} to ${afterProgress} file${afterProgress===1?'':'s'}`,'photo','Progress photos updated');
  return entries;
}
function statusIconHTML(status){
  if(status==='Partially Done') return '<span class="status-symbol rotating">↻</span>';
  if(status==='Ready for Inspection') return '<span class="status-symbol inspection">◇</span>';
  if(status==='Completed') return '<span class="status-symbol closed">✓</span>';
  return '<span class="status-symbol open"></span>';
}
function locationBreadcrumb(item){
  const root=(project&&(project.villa||project.name))||'Current Project';
  return [root,item.room].filter(Boolean).map(esc).join('<span class="crumb-sep">/</span>');
}
function workflowRailHTML(item,compact=false){
  const stages=[
    ['Reported','clipboard'],['Assigned','user'],['In Progress','clock'],['Inspection','check-circle'],['Closed','check']
  ];
  const index= item.status==='Completed'?4 : item.status==='Ready for Inspection'?3 : item.status==='Partially Done'?2 : (item.contact?1:0);
  return `<div class="workflow-rail ${compact?'compact':''}" aria-label="Issue workflow">${stages.map((s,i)=>`<div class="workflow-step ${i<index?'complete':i===index?'active':'pending'}"><span class="workflow-node">${iconSvg(s[1])}</span><span class="workflow-label">${s[0]}</span></div>`).join('')}</div>`;
}

/* ---------- branded video intro ---------- */
let introCloseTimer=null;
function setupBrandVideo(){
  const overlay=$('introOverlay'), video=$('introVideo'), bg=$('loginBgVideo');
  if(!overlay||!video) return;

  if(bg){
    bg.muted=true; bg.volume=0;
    bg.addEventListener('volumechange',()=>{ if(!bg.muted||bg.volume!==0){ bg.muted=true; bg.volume=0; } });
    bg.play().catch(()=>{});
  }

  $('introSoundBtn').onclick=()=>{
    if(!overlay.classList.contains('show')) return playIntro(true);
    video.muted=false; video.volume=1;
    video.play().then(()=>setIntroSoundState(true)).catch(()=>setIntroSoundState(false));
  };
  $('introSkipBtn').onclick=closeIntro;
  video.addEventListener('ended',closeIntro);
  document.querySelectorAll('[data-replay-intro]').forEach(btn=>btn.addEventListener('click',()=>playIntro(true)));

  // Try the requested sound-first intro. Browsers that require a gesture
  // automatically fall back to muted playback and expose the sound button.
  requestAnimationFrame(()=>playIntro(true));
}
function setIntroSoundState(on){
  const btn=$('introSoundBtn'); if(!btn) return;
  btn.innerHTML=on
    ? '<span class="intro-sound-icon">♪</span><span>Sound on</span>'
    : '<span class="intro-sound-icon">♪</span><span>Play with sound</span>';
  btn.classList.toggle('sound-on',on);
}
function playIntro(withSound=true){
  const overlay=$('introOverlay'), video=$('introVideo'), bg=$('loginBgVideo');
  if(!overlay||!video) return;
  if(introCloseTimer){ clearTimeout(introCloseTimer); introCloseTimer=null; }
  overlay.classList.remove('leaving'); overlay.classList.add('show'); overlay.removeAttribute('aria-hidden');
  if(bg) bg.pause();
  try{ video.currentTime=0; }catch(e){}
  video.muted=!withSound; video.volume=withSound?1:0;
  setIntroSoundState(withSound);
  const attempt=video.play();
  if(attempt) attempt.catch(()=>{
    video.muted=true; video.volume=0; setIntroSoundState(false);
    video.play().catch(closeIntro);
  });
}
function closeIntro(){
  const overlay=$('introOverlay'), video=$('introVideo'), bg=$('loginBgVideo');
  if(!overlay||!overlay.classList.contains('show')) return;
  overlay.classList.add('leaving');
  introCloseTimer=setTimeout(()=>{
    video.pause(); overlay.classList.remove('show','leaving'); overlay.setAttribute('aria-hidden','true');
    if(bg){ bg.muted=true; bg.volume=0; bg.play().catch(()=>{}); }
    introCloseTimer=null;
  },440);
}

/* ---------- init + auth ---------- */
let authMode='signin', authRole='owner';
(async function init(){
  hydrateIcons();
  if($('brandMark')) $('brandMark').innerHTML = iconSvg('hardhat');
  if($('authMark')) $('authMark').innerHTML = iconSvg('hardhat');
  applyTheme();
  setupAuthUI();
  setupBrandVideo();
  await Auth.init();
  Auth.onChange(u=>{ if(!u) document.body.classList.add('locked'); });
  if(Auth.user()) startApp(); else showAuth();
})();

function showAuth(){
  document.body.classList.remove('pending-screen');
  document.body.classList.add('locked');
  const badge=$('authBadge');
  if(window.BACKEND_MODE==='cloud'){ badge.className='auth-badge cloud'; badge.innerHTML=iconSvg('cloud')+'Cloud'; }
  else { badge.className='auth-badge local'; badge.innerHTML=iconSvg('lock')+'Local'; }
  refreshAuthFoot();
  setTimeout(()=>$('authEmail').focus(),80);
}

async function startApp(){
  document.body.classList.remove('locked');
  IS_SUPER = Auth.isSuper();
  try{ await Permissions.load(); }catch(e){}      // load super-admin-configured role permissions
  myProjectList = await Projects.mine();
  if(!myProjectList.length && !IS_SUPER) return showPending();
  const saved = localStorage.getItem('punchlist_project');
  const pick = myProjectList.find(p=>p.id===saved) || myProjectList[0];
  if(!pick){                       // super admin with no projects yet
    currentProjectId=null; CURRENT_ROLE=null; project=null; items=[];
    document.body.classList.remove('pending-screen');
    applyCaps(); renderProjectBanner(); renderRoomFilter(); render();
    return;
  }
  await openProject(pick.id);
}

async function openProject(pid){
  currentProjectId = pid;
  localStorage.setItem('punchlist_project', pid);
  CURRENT_ROLE = await Projects.roleIn(pid);
  project = await Projects.get(pid);
  items = (await DB.listItems(pid)).map(ensureIssueHistory);
  document.body.classList.remove('pending-screen','locked');
  applyCaps();
  renderProjectBanner(); renderRoomFilter(); render();
}

function showPending(){
  document.body.classList.add('pending-screen');
  document.body.classList.remove('locked');
  const u=Auth.user();
  if($('pendingEmail')) $('pendingEmail').textContent = u?u.email:'';
}

function applyCaps(){
  const u=Auth.user();
  ['has-add','has-status','has-project','has-manage','has-import','has-delete','has-super'].forEach(c=>document.body.classList.remove(c));
  if(CAP('addItem')) document.body.classList.add('has-add');
  if(CAP('setStatus')) document.body.classList.add('has-status');
  if(CAP('editProject')) document.body.classList.add('has-project');
  if(CAP('manageMembers')) document.body.classList.add('has-manage');
  if(CAP('importBackup')) document.body.classList.add('has-import');
  if(CAP('deleteItem')) document.body.classList.add('has-delete');
  if(IS_SUPER) document.body.classList.add('has-super');
  const roleLabel = IS_SUPER?'Super Admin':(CURRENT_ROLE?CURRENT_ROLE[0].toUpperCase()+CURRENT_ROLE.slice(1):'No project');
  const roleClass = IS_SUPER?'super':(CURRENT_ROLE||'contractor');
  let pill=$('rolePill');
  if(!pill){ pill=document.createElement('span'); pill.id='rolePill'; document.querySelector('.header-actions').prepend(pill); }
  pill.className='role-pill '+roleClass;
  pill.innerHTML=iconSvg(IS_SUPER||CURRENT_ROLE==='owner'?'shield':'user')+`<span class="rp-label">${roleLabel}</span>`;
  buildSwitcher();
  if(u){
    const sub = IS_SUPER?'Super Admin · all projects':(CURRENT_ROLE?roleLabel:'No project yet');
    $('menuUser').innerHTML=`<span class="mu-avatar">${esc((u.email[0]||'?').toUpperCase())}</span><span class="mu-info"><span class="mu-email">${esc(u.email)}</span><span class="mu-role ${roleClass}">${esc(sub)}</span></span>`;
    $('signOutWho').textContent=u.email;
  }
}

function buildSwitcher(){
  let sw=$('projectSwitcher');
  if(!sw){ sw=document.createElement('div'); sw.id='projectSwitcher'; sw.className='switcher'; document.querySelector('.header-actions').prepend(sw); }
  const cur=myProjectList.find(p=>p.id===currentProjectId);
  const canNew = IS_SUPER || CAP('editProject');
  if(!myProjectList.length && !canNew){ sw.style.display='none'; return; }
  sw.style.display='';
  sw.innerHTML=`<button class="switcher-btn" id="switcherBtn">${iconSvg('layers','width="15" height="15"')}<span class="sw-name">${esc(cur?cur.name:'Select project')}</span>${iconSvg('chevron-down','width="14" height="14"')}</button>
    <div class="switcher-menu" id="switcherMenu" hidden>
      <div class="menu-label">Projects</div>
      ${myProjectList.map(p=>`<button class="sw-item ${p.id===currentProjectId?'active':''}" data-pid="${p.id}">${iconSvg('layers','width="15" height="15"')}<span>${esc(p.name)}</span>${p.id===currentProjectId?iconSvg('check','width="15" height="15"'):''}</button>`).join('')||'<div class="sw-empty">No projects yet</div>'}
      ${canNew?`<div class="menu-sep"></div><button class="sw-item new" id="newProjectBtn">${iconSvg('plus','width="15" height="15"')}<span>New project…</span></button>`:''}
    </div>`;
  const btn=$('switcherBtn'), menu=$('switcherMenu');
  btn.onclick=e=>{ e.stopPropagation(); menu.toggleAttribute('hidden'); };
  document.addEventListener('click',e=>{ if(menu&&!menu.hasAttribute('hidden') && !e.target.closest('#projectSwitcher')) menu.setAttribute('hidden',''); });
  menu.querySelectorAll('.sw-item[data-pid]').forEach(b=>b.onclick=()=>{ menu.setAttribute('hidden',''); if(b.dataset.pid!==currentProjectId) openProject(b.dataset.pid); });
  const np=$('newProjectBtn'); if(np) np.onclick=()=>{ menu.setAttribute('hidden',''); promptNewProject(); };
}
async function promptNewProject(){
  const name=prompt('New project name:'); if(!name||!name.trim()) return;
  const proj=await Projects.create(name.trim());
  myProjectList=await Projects.mine();
  toast('Project created · join code '+proj.code,{type:'success', duration:7000});
  openProject(proj.id);
}

function setupAuthUI(){
  const setMode=m=>{
    authMode=m;
    $('tabSignIn').classList.toggle('active', m==='signin');
    $('tabSignUp').classList.toggle('active', m==='signup');
    $('authRoleField').style.display = m==='signup' ? 'flex' : 'none';
    updateAuthRoleFields();
    $('authSubmit').textContent = m==='signin' ? 'Sign in' : 'Create account';
    document.querySelector('.auth-brand h1').textContent = m==='signin' ? 'Welcome back' : 'Create your account';
    $('authModeLabel').textContent = m==='signin' ? 'Sign in to continue' : 'Create your account';
    $('authPassword').autocomplete = m==='signin' ? 'current-password' : 'new-password';
    hideAuthError();
  };
  $('tabSignIn').onclick=()=>setMode('signin');
  $('tabSignUp').onclick=()=>setMode('signup');
  document.querySelectorAll('#authRoleSeg .seg').forEach(b=>b.onclick=()=>{
    authRole=b.dataset.val;
    document.querySelectorAll('#authRoleSeg .seg').forEach(x=>x.classList.toggle('active', x===b));
    updateAuthRoleFields();
  });
  $('authForm').addEventListener('submit', async e=>{
    e.preventDefault(); hideAuthError();
    const email=$('authEmail').value.trim(), password=$('authPassword').value;
    const btn=$('authSubmit'), lbl=btn.textContent; btn.disabled=true; btn.textContent='Please wait…';
    try{
      if(authMode==='signup') await Auth.signUp({ email, password, role:authRole, projectName:$('authProjectName').value.trim(), projectCode:$('authProjectCode').value.trim() });
      else await Auth.signIn({email,password});
      await startApp();
      playIntro(true);
      $('authForm').reset(); updateAuthRoleFields();
    }catch(err){ showAuthError(err.message||'Something went wrong'); }
    finally{ btn.disabled=false; btn.textContent=lbl; }
  });
  setupCloudConnect();
}
function updateAuthRoleFields(){
  const signup = authMode==='signup';
  $('authProjectNameField').style.display = (signup && authRole==='owner') ? 'flex' : 'none';
  $('authProjectCodeField').style.display = (signup && (authRole==='consultant'||authRole==='contractor')) ? 'flex' : 'none';
}
function showAuthError(m){ const e=$('authError'); e.textContent=m; e.classList.add('show'); }
function hideAuthError(){ $('authError').classList.remove('show'); }
async function refreshAuthFoot(){
  const foot=$('authFoot');
  foot.innerHTML = window.BACKEND_MODE==='cloud'
    ? 'Cloud mode — accounts &amp; projects sync across devices.'
    : 'Local mode · data stays on this device. Connect cloud below to sync.';
}

function setupCloudConnect(){
  const link=$('cloudToggle'), panel=$('cloudPanel');
  if(!link) return;
  link.onclick=()=>{ panel.toggleAttribute('hidden'); link.classList.toggle('open'); };
  const creds=Cloud.creds();
  if(creds){ $('cloudUrl').value=creds.url||''; $('cloudKey').value=creds.key||''; }
  $('cloudConnectBtn').onclick=async()=>{
    const url=$('cloudUrl').value.trim(), key=$('cloudKey').value.trim(), st=$('cloudStatus');
    if(!url||!key){ st.className='cloud-status err'; st.textContent='Enter both the Project URL and the anon key.'; return; }
    st.className='cloud-status'; st.textContent='Testing connection…';
    try{ await Cloud.test(url,key); Cloud.save(url,key); st.className='cloud-status ok'; st.textContent='Connected! Reloading in cloud mode…'; setTimeout(()=>location.reload(),900); }
    catch(err){ st.className='cloud-status err'; st.textContent='Could not connect: '+err.message; }
  };
  $('cloudDisconnectBtn').onclick=()=>{ Cloud.clear(); location.reload(); };
  $('cloudDisconnectBtn').style.display = window.BACKEND_MODE==='cloud' ? '' : 'none';
}

$('signOutBtn').addEventListener('click', async ()=>{
  setMenu(false);
  await Auth.signOut();
  CURRENT_ROLE=null; IS_SUPER=false; currentProjectId=null; items=[]; project=null; myProjectList=[];
  showAuth();
});

/* ---------- theme ---------- */
function applyTheme(){
  const dark = (localStorage.getItem('punchlist_theme')||'light')==='dark';
  if(dark) document.documentElement.setAttribute('data-theme','dark');
  else document.documentElement.removeAttribute('data-theme');
  updateThemeBtn(dark);
}
function updateThemeBtn(dark){
  const b=$('darkToggle');
  b.querySelector('.ico').innerHTML = iconSvg(dark?'sun':'moon');
  b.querySelector('.btn-label').textContent = dark?'Light':'Dark';
}
$('darkToggle').addEventListener('click',()=>{
  const dark = document.documentElement.getAttribute('data-theme')==='dark';
  if(dark){ document.documentElement.removeAttribute('data-theme'); localStorage.setItem('punchlist_theme','light'); updateThemeBtn(false); }
  else{ document.documentElement.setAttribute('data-theme','dark'); localStorage.setItem('punchlist_theme','dark'); updateThemeBtn(true); }
});

/* ---------- toasts ---------- */
function toast(msg, {type='success', action, duration=3500}={}){
  const el=document.createElement('div');
  el.className='toast '+type;
  el.innerHTML=`<span class="t-ico">${iconSvg(type==='success'?'check-circle':'alert')}</span><span class="t-msg">${esc(msg)}</span>`;
  if(action){
    const b=document.createElement('button'); b.className='t-undo'; b.textContent=action.label;
    b.onclick=()=>{ action.fn(); dismiss(); };
    el.appendChild(b);
  }
  $('toastContainer').appendChild(el);
  const timer=setTimeout(dismiss, duration);
  function dismiss(){ clearTimeout(timer); el.classList.add('leaving'); setTimeout(()=>el.remove(),200); }
}

/* ---------- view toggle ---------- */
$('cardViewBtn').addEventListener('click',()=>setView('cards'));
$('tableViewBtn').addEventListener('click',()=>setView('table'));
function setView(m){
  viewMode=m;
  $('cardViewBtn').classList.toggle('active', m==='cards');
  $('tableViewBtn').classList.toggle('active', m==='table');
  render();
}

/* ---------- filters / sort ---------- */
['searchInput','filterRoom','filterType','filterStatus','filterPriority','sortBy'].forEach(id=>{
  $(id).addEventListener('input',render); $(id).addEventListener('change',render);
});
function renderRoomFilter(){
  const rooms=[...new Set(items.map(i=>i.room).filter(Boolean))].sort();
  const cur=$('filterRoom').value;
  $('filterRoom').innerHTML='<option value="">Project / Location</option>'+rooms.map(r=>`<option ${r===cur?'selected':''}>${esc(r)}</option>`).join('');
  $('roomSuggestions').innerHTML=rooms.map(r=>`<option value="${esc(r)}">`).join('');
}
function getFiltered(){
  let list=[...items];
  const q=$('searchInput').value.toLowerCase().trim();
  if(q) list=list.filter(i=>(i.room||'').toLowerCase().includes(q)||(i.description||'').toLowerCase().includes(q)||(i.contact||'').toLowerCase().includes(q));
  if($('filterRoom').value) list=list.filter(i=>i.room===$('filterRoom').value);
  if($('filterType').value) list=list.filter(i=>i.type===$('filterType').value);
  if($('filterStatus').value) list=list.filter(i=>i.status===$('filterStatus').value);
  if($('filterPriority').value) list=list.filter(i=>i.priority===$('filterPriority').value);
  const pr={High:0,Medium:1,Low:2}, sr={'Not Done':0,'Partially Done':1,'Ready for Inspection':2,'Completed':3};
  const k=$('sortBy').value;
  list.sort((a,b)=>{
    if(k==='priority') return pr[a.priority]-pr[b.priority] || sr[a.status]-sr[b.status];
    if(k==='status') return sr[a.status]-sr[b.status];
    if(k==='updated') return (b.updatedAt||0)-(a.updatedAt||0);
    if(k==='type') return (a.type||'').localeCompare(b.type||'');
    return (a.room||'').localeCompare(b.room||'');
  });
  return list;
}

function renderActiveFilters(){
  const wrap=$('activeFilters'); wrap.innerHTML='';
  const chips=[];
  const add=(id,label,val)=>{ if(val) chips.push({id,label,val}); };
  add('searchInput','Search',$('searchInput').value.trim());
  add('filterRoom','Room',$('filterRoom').value);
  add('filterType','Type',$('filterType').value);
  add('filterStatus','Status',$('filterStatus').value);
  add('filterPriority','Priority',$('filterPriority').value);
  if(!chips.length){ wrap.style.display='none'; return; }
  wrap.style.display='flex';
  chips.forEach(c=>{
    const el=document.createElement('span'); el.className='fchip';
    const shown=c.id==='filterStatus'?statusLabel(c.val):c.val;
    el.innerHTML=`${esc(shown)} <button aria-label="Remove filter">${iconSvg('x','width="14" height="14"')}</button>`;
    el.querySelector('button').onclick=()=>{ $(c.id).value=''; render(); };
    wrap.appendChild(el);
  });
  const clr=document.createElement('button'); clr.className='fchip clear-all'; clr.textContent='Clear all';
  clr.onclick=clearFilters; wrap.appendChild(clr);
}
function clearFilters(){
  ['searchInput','filterRoom','filterType','filterStatus','filterPriority'].forEach(id=>$(id).value='');
  render();
}
$('clearFiltersBtn2').addEventListener('click',clearFilters);

/* ---------- render ---------- */
function render(){
  renderDashboard();
  renderActiveFilters();
  const list=getFiltered();
  const c=$('itemsContainer');
  c.className = viewMode==='cards'?'cards-view':'table-view';
  c.innerHTML='';
  $('emptyState').style.display = items.length===0?'block':'none';
  $('noMatchState').style.display = (items.length>0 && list.length===0)?'block':'none';
  c.style.display = list.length===0?'none':'';
  if(list.length===0) return;
  if(viewMode==='cards') list.forEach(it=>c.appendChild(renderCard(it)));
  else c.appendChild(renderTable(list));
}

function renderDashboard(){
  const total=items.length;
  const not=items.filter(i=>i.status==='Not Done').length;
  const part=items.filter(i=>i.status==='Partially Done').length;
  const ready=items.filter(i=>i.status==='Ready for Inspection').length;
  const done=items.filter(i=>i.status==='Completed').length;
  const high=items.filter(i=>i.priority==='High'&&i.status!=='Completed').length;
  const pct=total?Math.round((done/total)*100):0;
  const af=id=>$(id).value;
  const now=new Date(); now.setHours(0,0,0,0);
  const weekEnd=new Date(now); weekEnd.setDate(weekEnd.getDate()+7);
  const openItems=items.filter(i=>i.status!=='Completed');
  const overdue=openItems.filter(i=>i.expectedDate&&new Date(i.expectedDate+'T00:00:00')<now).length;
  const dueWeek=openItems.filter(i=>{ if(!i.expectedDate)return false; const d=new Date(i.expectedDate+'T00:00:00'); return d>=now&&d<=weekEnd; }).length;
  const projects=Math.max(myProjectList.length,currentProjectId?1:0);
  $('dashboard').innerHTML=`
    <button class="metric-card metric-primary ${af('filterStatus')==='Not Done'?'active':''}" data-filter="Not Done">
      <span class="metric-kicker">Live issue load</span>
      <div class="metric-main"><strong class="num">${openItems.length}</strong><span>Open Issues</span></div>
      <div class="metric-foot"><span class="metric-alert">${overdue} overdue</span><span>${high} high priority</span></div>
      <svg class="trend-line" viewBox="0 0 220 44" preserveAspectRatio="none" aria-hidden="true"><path d="M2 36 C32 34,42 18,70 24 S110 40,136 21 S176 9,218 14"/><path class="trend-fill" d="M2 36 C32 34,42 18,70 24 S110 40,136 21 S176 9,218 14 L218 44 L2 44Z"/></svg>
    </button>
    <button class="metric-card metric-due" data-filter="due"><span class="metric-icon">${iconSvg('calendar')}</span><span class="metric-kicker">Due this week</span><strong class="num">${dueWeek}</strong><small>items require attention</small></button>
    <button class="metric-card metric-small metric-closed ${af('filterStatus')==='Completed'?'active':''}" data-filter="Completed"><span class="metric-icon">${iconSvg('check-circle')}</span><strong class="num">${done}</strong><span>Closed</span></button>
    <button class="metric-card metric-small" data-filter="all"><span class="metric-icon">${iconSvg('layers')}</span><strong class="num">${projects}</strong><span>Projects</span></button>
    <button class="metric-card metric-small metric-inspection ${af('filterStatus')==='Ready for Inspection'?'active':''}" data-filter="Ready for Inspection"><span class="metric-icon">${iconSvg('clipboard')}</span><strong class="num">${ready}</strong><span>Inspections</span></button>
    <section class="workflow-overview" id="workflowOverview"><div class="workflow-copy"><span class="metric-kicker">Construction progress</span><strong>${pct}% complete</strong><small>${part} in progress · ${ready} ready for inspection</small></div>${workflowRailHTML({status:ready?'Ready for Inspection':part?'Partially Done':done===total&&total?'Completed':'Not Done',contact:part||ready||done},false)}</section>
  `;
  $('dashboard').querySelectorAll('[data-filter]').forEach(btn=>{
    btn.onclick=()=>{
      const f=btn.dataset.filter;
      if(f==='all'){ clearFilters(); return; }
      if(f==='due'){ $('sortBy').value='updated'; render(); return; }
      if(f==='High'){ $('filterPriority').value = $('filterPriority').value==='High'?'':'High'; $('filterStatus').value=''; }
      else{ $('filterStatus').value = $('filterStatus').value===f?'':f; $('filterPriority').value=''; }
      render();
    };
  });
}

function allMedia(item){ return [...(item.beforePhotos||[]), ...(item.afterPhotos||[])]; }
function coverMedia(item){
  const a=(item.afterPhotos||[]).find(m=>!m.isVideo)||(item.afterPhotos||[])[0];
  const b=(item.beforePhotos||[]).find(m=>!m.isVideo)||(item.beforePhotos||[])[0];
  return a||b||null;
}

function statusSelectHTML(item){
  return `<div class="status-select-wrap sel-${slug(item.status)}" data-id="${item.id}">
    ${statusIconHTML(item.status)}
    <select class="status-select sel-${slug(item.status)}" aria-label="Status for ${esc(item.room)}" ${CAP('setStatus')?'':'disabled'}>
      <option value="Not Done" ${item.status==='Not Done'?'selected':''}>Open</option>
      <option value="Partially Done" ${item.status==='Partially Done'?'selected':''}>In Progress</option>
      <option value="Ready for Inspection" ${item.status==='Ready for Inspection'?'selected':''}>Ready for Inspection</option>
      <option value="Completed" ${item.status==='Completed'?'selected':''}>Closed</option>
    </select></div>`;
}
function bindStatusSelect(scope, item){
  const sel=scope.querySelector('.status-select');
  sel.addEventListener('click',e=>e.stopPropagation());
  if(!CAP('setStatus')) return;                // contractors can't change status
  sel.addEventListener('change',async e=>{
    e.stopPropagation();
    const previous=item.status;
    item.status=sel.value; item.updatedAt=Date.now();
    ensureIssueHistory(item).history.unshift(auditEntry(`Status changed from ${statusLabel(previous)} to ${statusLabel(item.status)}`,{kind:'status',title:'Status updated'}));
    await DB.saveItem(item);
    toast(`${item.room || 'Item'} → ${statusLabel(item.status)}`,{type:'success'});
    render();
  });
}

function renderCard(item){
  const div=document.createElement('div');
  div.className=`card priority-${item.priority}`;
  const cover=coverMedia(item);
  const media=allMedia(item);
  const thumb = cover
    ? (cover.isVideo?`<video src="${cover.src}" muted preload="metadata"></video>`:`<img src="${cover.src}" alt="${esc(item.room)} photo" loading="lazy">`)
    : `<span class="thumb-empty">${iconSvg('camera')}<small>Tap to add photos</small></span>`;
  const stripHtml = media.length>1 ? `<div class="card-strip">${media.map((m,i)=>
      m.isVideo
        ? `<button class="cs-thumb" data-i="${i}" aria-label="View video"><video src="${m.src}" muted></video><span class="cs-vid">${iconSvg('play','width="10" height="10"')}</span></button>`
        : `<button class="cs-thumb" data-i="${i}" aria-label="View photo"><img src="${m.src}" alt="" loading="lazy"></button>`
    ).join('')}</div>` : '';
  const issueTitle=(item.description||item.room||'Untitled issue').trim();
  const due=item.expectedDate?new Date(item.expectedDate+'T00:00:00'):null;
  const overdue=due&&item.status!=='Completed'&&due<new Date(new Date().setHours(0,0,0,0));
  div.innerHTML=`
    <div class="card-thumb" data-gallery>
      ${thumb}
      ${cover?'<span class="annotation-marker"><i></i></span>':''}
      ${media.length?`<span class="thumb-count">${iconSvg('image','width="13" height="13"')}${media.length}</span>`:''}
    </div>
    <div class="card-body">
      ${stripHtml}
      <div class="priority-label pri-${item.priority}"><span>${esc(item.priority)}</span><small>priority</small></div>
      <div class="card-top"><span class="card-room">${esc(issueTitle)}</span></div>
      <div class="location-breadcrumb">${sIco('layers')}<span>${locationBreadcrumb(item)}</span></div>
      <div class="card-tag-row"><span class="type-chip ${typeClass(item.type)}">${sIco(typeIcon(item.type))}${esc(item.type)}</span>${statusSelectHTML(item)}</div>
      <div class="card-meta">
        <span class="meta-line meta-assignee">${sIco('user')}<span>Assigned to</span>${item.contact?`<strong>${esc(item.contact)}</strong>`:'<strong>Unassigned</strong>'}</span>
        ${item.expectedDate && item.status!=='Completed'?`<span class="meta-line eta ${overdue?'overdue':''}">${sIco('calendar')}<span>Due</span><strong>${esc(due.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}))}</strong></span>`:''}
      </div>
      ${workflowRailHTML(item,true)}
      <div class="card-actions">
        <button class="btn btn-outline" data-edit><span>View details <small class="card-update-count">${(item.history||[]).length} update${(item.history||[]).length===1?'':'s'}</small></span>${sIco('chevron-right')}</button>
      </div>
    </div>`;
  div.querySelector('[data-edit]').addEventListener('click',()=>openModal(item.id));
  const thumbEl=div.querySelector('[data-gallery]');
  thumbEl.addEventListener('click',()=>{ if(media.length) openGallery(media,0); else openModal(item.id); });
  div.querySelectorAll('.cs-thumb').forEach(b=>b.addEventListener('click',e=>{ e.stopPropagation(); openGallery(media, parseInt(b.dataset.i)); }));
  bindStatusSelect(div, item);
  return div;
}

const SORT_COLS={room:'Room',type:'Type',status:'Status',priority:'Priority',updated:'Updated'};
function renderTable(list){
  const wrap=document.createElement('div'); wrap.className='table-view';
  const table=document.createElement('table');
  const cur=$('sortBy').value;
  const th=(key,label,extra='')=>`<th data-sort="${key}" class="${cur===key?'sorted':''}" ${extra}><span class="th-in">${label}${cur===key?`<span class="sort-ico">${iconSvg('listchecks')}</span>`:''}</span></th>`;
  table.innerHTML=`<thead><tr>
    <th style="width:58px"></th>
    ${th('room','Room')}<th>Description</th>${th('type','Type')}${th('status','Status')}${th('priority','Priority')}<th>Contacted</th><th style="width:60px"></th>
  </tr></thead><tbody></tbody>`;
  const tb=table.querySelector('tbody');
  list.forEach(item=>{
    const cover=coverMedia(item), media=allMedia(item);
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td>${cover && !cover.isVideo?`<img class="thumb-mini" src="${cover.src}" alt="">`:`<span class="thumb-mini-ph">${iconSvg(cover?'video':'camera','width="18" height="18"')}</span>`}</td>
      <td class="t-room">${esc(item.room)}</td>
      <td class="t-desc">${esc(item.description)}</td>
      <td><span class="type-chip ${typeClass(item.type)}">${sIco(typeIcon(item.type))}${esc(item.type)}</span></td>
      <td class="td-status"></td>
      <td><span class="table-priority pri-${item.priority}">${esc(item.priority)}</span></td>
      <td>${esc(item.contact)||'<span style="color:var(--text-3)">—</span>'}</td>
      <td><button class="icon-btn" data-edit aria-label="Edit">${sIco('edit')}</button></td>`;
    tr.querySelector('.td-status').innerHTML=statusSelectHTML(item);
    bindStatusSelect(tr.querySelector('.td-status'), item);
    tr.querySelector('[data-edit]').addEventListener('click',()=>openModal(item.id));
    const mini=tr.querySelector('.thumb-mini');
    if(mini && media.length) mini.addEventListener('click',()=>openGallery(media,0));
    tb.appendChild(tr);
  });
  table.querySelectorAll('th[data-sort]').forEach(h=>{
    h.addEventListener('click',()=>{ $('sortBy').value=h.dataset.sort; render(); });
  });
  wrap.appendChild(table);
  return wrap;
}

/* ---------- lightbox gallery ---------- */
function openGallery(media,idx){
  gallery=media; galleryIdx=idx; renderGallery(); $('lightbox').style.display='flex';
}
function renderGallery(){
  const m=gallery[galleryIdx]; if(!m) return;
  $('lightboxContent').innerHTML = m.isVideo?`<video src="${m.src}" controls autoplay></video>`:`<img src="${m.src}" alt="">`;
  $('lightboxCounter').textContent = `${galleryIdx+1} / ${gallery.length}`;
  const multi=gallery.length>1;
  $('lightboxPrev').style.display=multi?'':'none';
  $('lightboxNext').style.display=multi?'':'none';
  $('lightboxCounter').style.display=multi?'':'none';
}
$('lightboxPrev').addEventListener('click',()=>{ galleryIdx=(galleryIdx-1+gallery.length)%gallery.length; renderGallery(); });
$('lightboxNext').addEventListener('click',()=>{ galleryIdx=(galleryIdx+1)%gallery.length; renderGallery(); });
$('lightboxClose').addEventListener('click',closeLightbox);
$('lightbox').addEventListener('click',e=>{ if(e.target===$('lightbox')) closeLightbox(); });
function closeLightbox(){ $('lightbox').style.display='none'; $('lightboxContent').innerHTML=''; }

/* ---------- modal ---------- */
function openModal(id){
  currentEditId=id;
  const it=id?items.find(i=>i.id===id):null;
  const ro=!CAP('editItem');
  $('modalTitle').textContent = ro ? 'Update work' : (it?'Edit Item':'Add Item');
  $('itemId').value=id||'';
  $('itemRoom').value=it?.room||'';
  $('itemDescription').value=it?.description||'';
  const known=['General Construction','Painting','Electrical','Camera','Plumbing','HVAC','Joinery','Civil Works'];
  if(it && !known.includes(it.type)){ $('itemType').value='Others'; $('itemTypeOther').value=it.type; $('itemTypeOther').style.display='block'; }
  else{ $('itemType').value=it?.type||'General Construction'; $('itemTypeOther').value=''; $('itemTypeOther').style.display='none'; }
  editStatus=it?.status||'Not Done'; editPriority=it?.priority||'Medium';
  syncSeg('statusSeg',editStatus); syncSeg('prioritySeg',editPriority);
  if($('modalWorkflowRail')) $('modalWorkflowRail').innerHTML=workflowRailHTML({status:editStatus,contact:it?.contact||''},false);
  $('itemContact').value=it?.contact||'';
  $('itemExpectedDate').value=it?.expectedDate||'';
  tempBefore=it?[...(it.beforePhotos||[])]:[];
  tempAfter=it?[...(it.afterPhotos||[])]:[];
  tempHistory=it?[...ensureIssueHistory(it).history]:[];
  historyBaseline=tempHistory.length;
  renderThumbs('beforeThumbs',tempBefore); renderThumbs('afterThumbs',tempAfter);
  renderHistory();
  applyModalPermissions(ro);
  $('deleteItemBtn').style.display=(it && !ro)?'inline-flex':'none';
  $('saveItemBtn').querySelector('.btn-label').textContent = ro?'Save my updates':'Save Item';
  $('itemModal').style.display='flex';
  setTimeout(()=>{ (ro?$('itemExpectedDate'):$('itemRoom')).focus(); },60);
}
function applyModalPermissions(ro){
  ['itemRoom','itemDescription','itemType','itemTypeOther','itemContact'].forEach(id=>$(id).disabled=ro);
  $('statusSeg').classList.toggle('disabled', ro);
  $('prioritySeg').classList.toggle('disabled', ro);
  $('beforeDrop').style.display = ro?'none':'flex';
  $('beforeThumbs').style.pointerEvents = ro?'none':'';
  $('expectedHint').textContent = ro ? 'Set the ETA for this pending work' : 'ETA for this work';
  let banner=$('roBanner');
  if(ro && !banner){
    banner=document.createElement('div'); banner.id='roBanner'; banner.className='ro-banner';
    banner.innerHTML=`${sIco('lock')}<span>Contractor view — you can add comments, set the expected completion date, and add progress photos. The owner's details are read-only.</span>`;
    $('itemModal').querySelector('.modal-body').prepend(banner);
  } else if(!ro && banner){ banner.remove(); }
}
function closeModal(){ $('itemModal').style.display='none'; }
$('closeModalBtn').addEventListener('click',closeModal);
$('cancelItemBtn').addEventListener('click',closeModal);
$('addItemBtn').addEventListener('click',()=>openModal(null));
$('emptyAddBtn').addEventListener('click',()=>openModal(null));
$('itemModal').addEventListener('click',e=>{ if(e.target===$('itemModal')) closeModal(); });
$('itemType').addEventListener('change',()=>{ $('itemTypeOther').style.display=$('itemType').value==='Others'?'block':'none'; });

/* workspace navigation: every sidebar item opens a real in-app destination */
let activeNavView='dashboard';
function navShell(title, eyebrow, body, actions=''){
  return `<div class="nav-page-head"><div><span class="nav-page-eyebrow">${esc(eyebrow)}</span><h1>${esc(title)}</h1></div><div class="nav-page-actions">${actions}</div></div><div class="nav-page-body">${body}</div>`;
}
function showNavPage(view){
  activeNavView=view||'dashboard';
  document.querySelectorAll('.nav-item[data-nav-view]').forEach(n=>n.classList.toggle('active',n.dataset.navView===activeNavView));
  const page=$('navPage');
  const isDashboard=activeNavView==='dashboard', isIssues=activeNavView==='issues';
  page.hidden=isDashboard;
  ['projectBanner','dashboard','toolbar','activeFilters','itemsContainer','emptyState','noMatchState','mobilePunchBtn'].forEach(id=>{ const el=$(id); if(el) el.hidden=!(isDashboard||isIssues); });
  if(isDashboard){ window.scrollTo({top:0,behavior:'smooth'}); return; }
  if(isIssues){ page.hidden=true; window.scrollTo({top:0,behavior:'smooth'}); return; }
  renderNavPage(); window.scrollTo({top:0,behavior:'smooth'});
}
function renderNavPage(){
  const page=$('navPage'); if(!page||activeNavView==='dashboard'||activeNavView==='issues') return;
  const open=items.filter(i=>i.status!=='Completed'), ready=items.filter(i=>i.status==='Ready for Inspection');
  if(activeNavView==='projects'){
    const cards=myProjectList.length?myProjectList.map(p=>`<article class="nav-project-card"><span class="nav-project-icon">${iconSvg('layers')}</span><div><h3>${esc(p.name||'Untitled project')}</h3><p>${esc(p.location||p.villa||'Project workspace')}</p><small>${p.id===currentProjectId?'Current project':'Project'} · ${p.code?esc(p.code):'No join code'}</small></div><button class="btn btn-outline sm" data-switch-project="${esc(p.id)}">${p.id===currentProjectId?'Open':'Switch'}</button></article>`).join(''):'<div class="nav-empty">No projects are assigned to your account yet.</div>';
    page.innerHTML=navShell('Projects','Workspace',`<div class="nav-project-grid">${cards}</div>`,CAP('editProject')?`<button class="btn btn-primary" id="navCreateProject">${sIco('plus')}New project</button>`:'');
    page.querySelector('#navCreateProject')?.addEventListener('click',openProjectModal);
    page.querySelectorAll('[data-switch-project]').forEach(b=>b.addEventListener('click',async()=>{ const p=myProjectList.find(x=>x.id===b.dataset.switchProject); if(p){ await openProject(p.id); showNavPage('projects'); } }));
  } else if(activeNavView==='inspections'){
    const list=ready.length?ready.map(i=>`<article class="nav-list-row"><span class="nav-list-icon">${iconSvg('check-circle')}</span><div><strong>${esc(i.description||i.room||'Inspection item')}</strong><p>${locationBreadcrumb(i)}</p></div><span class="nav-row-meta">${i.expectedDate?esc(fmtDate(new Date(i.expectedDate+'T00:00:00').getTime())):'Schedule needed'}</span><button class="btn btn-outline sm" data-open-issue="${esc(i.id)}">Review</button></article>`).join(''):'<div class="nav-empty">No items are ready for inspection. Move an open issue through the progress rail to see it here.</div>';
    page.innerHTML=navShell('Inspections','Management',`<div class="nav-summary"><strong>${ready.length}</strong><span>ready for inspection</span><strong>${open.length}</strong><span>open items in workflow</span></div><div class="nav-list">${list}</div>`);
    page.querySelectorAll('[data-open-issue]').forEach(b=>b.onclick=()=>openModal(b.dataset.openIssue));
  } else if(activeNavView==='reports'){
    const closed=items.filter(i=>i.status==='Completed').length, overdue=open.filter(i=>i.expectedDate&&new Date(i.expectedDate+'T00:00:00')<new Date(new Date().setHours(0,0,0,0))).length;
    page.innerHTML=navShell('Reports','Management',`<div class="report-hero"><span class="report-icon">${iconSvg('clipboard')}</span><div><h2>${esc(project?.docTitle||'Owner’s Punch List')}</h2><p>Generate a signed snapshot of project health, open work, evidence, and issue activity.</p></div></div><div class="report-stats"><div><strong>${items.length}</strong><span>Total issues</span></div><div><strong>${open.length}</strong><span>Open work</span></div><div><strong>${closed}</strong><span>Closed</span></div><div><strong>${overdue}</strong><span>Overdue</span></div></div>`, `<button class="btn btn-primary" id="navExportReport">${sIco('download')}Export PDF</button>`);
    page.querySelector('#navExportReport').onclick=()=>$('exportPdfBtn').click();
  } else if(activeNavView==='approvals'){
    page.innerHTML=navShell('Approvals','Management',`<div class="approval-hero"><span class="report-icon">${iconSvg('shield')}</span><div><h2>Access and project approvals</h2><p>Review pending join requests and manage who can update this project.</p></div></div><div class="nav-callout">${sIco('users')}<span>Approval decisions are recorded against the project membership and reflected immediately in team access.</span></div>`,`<button class="btn btn-primary" id="navManageApprovals">${sIco('users')}Manage approvals</button>`);
    page.querySelector('#navManageApprovals').onclick=openMembers;
  } else if(activeNavView==='messages'){
    const feed=items.flatMap(i=>(i.history||[]).map(h=>({...h,issue:i}))).sort((a,b)=>(b.date||0)-(a.date||0)).slice(0,12);
    const rows=feed.length?feed.map(h=>`<article class="message-row"><span class="message-avatar">${esc(actorInitials(h.by))}</span><div><strong>${esc(h.title||'Issue update')}</strong><p>${esc(h.issue.description||h.issue.room||'Issue')} · ${esc(h.text||'')}</p><small>Signed by ${esc(actorName(h.by))} · ${esc(h.role||'team member')} · ${esc(auditDate(h.date))}</small></div><button class="icon-btn" data-open-issue="${esc(h.issue.id)}" aria-label="Open issue">${sIco('chevron-right')}</button></article>`).join(''):'<div class="nav-empty">Issue updates will appear here as your team records work.</div>';
    page.innerHTML=navShell('Messages','Communication',`<p class="nav-intro">Recent signed updates from across the project.</p><div class="message-list">${rows}</div>`);
    page.querySelectorAll('[data-open-issue]').forEach(b=>b.onclick=()=>openModal(b.dataset.openIssue));
  } else if(activeNavView==='team'){
    page.innerHTML=navShell('Team','Communication',`<p class="nav-intro">Project members, roles, and access status.</p><div class="nav-team-list"><div class="nav-loading">Loading team…</div></div>`,`<button class="btn btn-primary" id="navManageTeam">${sIco('users')}Manage team</button>`);
    page.querySelector('#navManageTeam').onclick=openMembers;
    (async()=>{ try{ const mems=currentProjectId?await Projects.membersOf(currentProjectId):[]; const list=page.querySelector('.nav-team-list'); list.innerHTML=mems.length?mems.map(m=>`<div class="team-row"><span class="message-avatar">${esc((m.email?.[0]||'?').toUpperCase())}</span><div><strong>${esc(m.email)}</strong><small>${esc(m.role||'member')} · ${esc(m.status||'')}</small></div>${roleBadge(m.role||'member')}</div>`).join(''):'<div class="nav-empty">No team members yet.</div>'; }catch(e){ page.querySelector('.nav-team-list').innerHTML='<div class="nav-empty">Team data is unavailable right now.</div>'; } })();
  }
}
document.querySelectorAll('.nav-item[data-nav-view]').forEach(btn=>btn.addEventListener('click',()=>showNavPage(btn.dataset.navView)));

const mobileSheet=$('mobileActionSheet');
function setMobileSheet(open){
  if(!mobileSheet) return;
  mobileSheet.toggleAttribute('hidden',!open);
  document.body.classList.toggle('sheet-open',open);
}
if($('mobilePunchBtn')) $('mobilePunchBtn').onclick=()=>setMobileSheet(true);
if($('closeActionSheet')) $('closeActionSheet').onclick=()=>setMobileSheet(false);
if(mobileSheet) mobileSheet.addEventListener('click',e=>{ if(e.target===mobileSheet) setMobileSheet(false); });
document.querySelectorAll('[data-mobile-action]').forEach(btn=>btn.addEventListener('click',()=>{
  const action=btn.dataset.mobileAction; setMobileSheet(false); openModal(null);
  if(action==='camera') setTimeout(()=>{ const inp=$('itemPhotosBefore'); inp.setAttribute('capture','environment'); inp.click(); },120);
  else if(action==='upload') setTimeout(()=>{ const inp=$('itemPhotosBefore'); inp.removeAttribute('capture'); inp.click(); },120);
  else if(action==='qr') setTimeout(()=>{ $('itemRoom').placeholder='Scan result or enter QR location code'; $('itemRoom').focus(); toast('QR location mode · enter or scan the site location code',{type:'info'}); },120);
}));

/* segmented controls */
function syncSeg(groupId,val){
  document.querySelectorAll(`#${groupId} .seg`).forEach(b=>b.classList.toggle('active', b.dataset.val===val));
}
document.querySelectorAll('#statusSeg .seg').forEach(b=>b.addEventListener('click',()=>{ editStatus=b.dataset.val; syncSeg('statusSeg',editStatus); if($('modalWorkflowRail')) $('modalWorkflowRail').innerHTML=workflowRailHTML({status:editStatus,contact:$('itemContact').value},false); }));
document.querySelectorAll('#prioritySeg .seg').forEach(b=>b.addEventListener('click',()=>{ editPriority=b.dataset.val; syncSeg('prioritySeg',editPriority); }));

/* uploads + drag/drop */
async function addFiles(fileList, arr, containerId){
  const files = Array.from(fileList); // snapshot now: clearing input.value later empties the live FileList mid-loop
  for(const f of files){ if(f.type.startsWith('image')||f.type.startsWith('video')) arr.push(await fileToMedia(f)); }
  renderThumbs(containerId, arr);
}
$('itemPhotosBefore').addEventListener('change',e=>{ addFiles(e.target.files,tempBefore,'beforeThumbs'); e.target.value=''; });
$('itemPhotosAfter').addEventListener('change',e=>{ addFiles(e.target.files,tempAfter,'afterThumbs'); e.target.value=''; });
function renderThumbs(containerId, arr){
  const c=$(containerId); c.innerHTML='';
  arr.forEach((m,idx)=>{
    const d=document.createElement('div'); d.className='thumb-item';
    d.innerHTML=(m.isVideo?`<video src="${m.src}"></video><span class="badge-vid">${iconSvg('play','width="11" height="11"')}</span>`:`<img src="${m.src}" alt="">`)
      +`<button class="remove-thumb" aria-label="Remove">${iconSvg('x','width="12" height="12"')}</button>`;
    d.querySelector('img,video').addEventListener('click',()=>openGallery(arr,idx));
    d.querySelector('.remove-thumb').addEventListener('click',()=>{ arr.splice(idx,1); renderThumbs(containerId,arr); });
    c.appendChild(d);
  });
}
/* drop zones need live array refs; wire with getters */
function wireDrop(dropId, getArr, containerId){
  const dz=$(dropId);
  ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{ e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{ e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop',e=>{ if(e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files,getArr(),containerId); });
}
wireDrop('beforeDrop',()=>tempBefore,'beforeThumbs');
wireDrop('afterDrop',()=>tempAfter,'afterThumbs');

/* history */
$('addHistoryBtn').addEventListener('click',()=>{
  const t=$('historyNoteInput').value.trim(); if(!t) return;
  tempHistory.unshift(auditEntry(t,{kind:'comment',title:'Work update',draft:true})); $('historyNoteInput').value=''; renderHistory(); $('historyNoteInput').focus();
});
$('historyNoteInput').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); $('addHistoryBtn').click(); } });
function renderHistory(){
  const l=$('historyList'); l.innerHTML='';
  if(!tempHistory.length){ l.innerHTML='<li class="history-empty">No signed updates yet.</li>'; return; }
  tempHistory.forEach((h,idx)=>{
    const canRemove = !!h.draft;
    const who=h.by||'SitePunch system';
    const li=document.createElement('li');
    li.className=`history-entry history-${slug(h.kind||'update')}`;
    li.innerHTML=`<span class="history-avatar" aria-hidden="true">${esc(actorInitials(who))}</span><span class="history-content"><span class="history-topline"><strong>${esc(h.title||'Work update')}</strong><span class="h-date">${esc(auditDate(h.date))}</span></span><span class="h-text">${esc(h.text)}</span><span class="h-signature">${iconSvg('check-circle','width="12" height="12"')} Signed by <b>${esc(actorName(who))}</b> · ${esc(who)} · ${esc(h.role||'team member')}</span></span>${canRemove?`<button class="remove-hist" aria-label="Remove draft update">${iconSvg('trash','width="14" height="14"')}</button>`:''}`;
    const rm=li.querySelector('.remove-hist');
    if(rm) rm.addEventListener('click',()=>{ tempHistory.splice(idx,1); renderHistory(); });
    l.appendChild(li);
  });
}

/* save / delete */
$('saveItemBtn').addEventListener('click',async()=>{
  if(CAP('editItem')){
    if(!currentProjectId){ toast('Select or create a project first',{type:'info'}); return; }
    const room=$('itemRoom').value.trim();
    if(!room){ toast('Please enter a room / area first',{type:'info'}); $('itemRoom').focus(); return; }
    const type = $('itemType').value==='Others' && $('itemTypeOther').value.trim() ? $('itemTypeOther').value.trim() : $('itemType').value;
    const existing = currentEditId?items.find(i=>i.id===currentEditId):null;
    const item={
      id:currentEditId||uid(), projectId:currentProjectId, room, description:$('itemDescription').value.trim(), type,
      status:editStatus, priority:editPriority, contact:$('itemContact').value.trim(),
      expectedDate:$('itemExpectedDate').value||'',
      beforePhotos:tempBefore, afterPhotos:tempAfter, history:tempHistory.map(h=>({...h,draft:false})),
      createdAt:existing?.createdAt||Date.now(), updatedAt:Date.now()
    };
    if(existing) item.history.unshift(...auditChanges(existing,item));
    else item.history.push(auditEntry('Issue record created and assigned to the project workflow',{kind:'created',title:'Issue created',date:item.createdAt}));
    const saved=await DB.saveItem(item);
    const i=items.findIndex(x=>x.id===item.id); if(i>=0) items[i]=saved||item; else items.push(saved||item);
    renderRoomFilter(); render(); closeModal();
    toast(existing?'Item updated':'Item added',{type:'success'});
  } else {
    /* contractor: only expected date, after photos, new comments */
    if(!currentEditId){ closeModal(); return; }
    const orig=items.find(i=>i.id===currentEditId);
    const newNotes=tempHistory.filter(h=>h.draft).map(h=>h.text).reverse();
    if((orig?.expectedDate||'')!==($('itemExpectedDate').value||'')) newNotes.push(`Due date updated from ${orig?.expectedDate||'Not set'} to ${$('itemExpectedDate').value||'Not set'}`);
    if((orig?.afterPhotos||[]).length!==tempAfter.length) newNotes.push(`Progress evidence updated from ${(orig?.afterPhotos||[]).length} to ${tempAfter.length} file${tempAfter.length===1?'':'s'}`);
    try{
      let updated=await DB.contractorUpdate(currentEditId,{ expectedDate:$('itemExpectedDate').value||'', afterPhotos:tempAfter, comment:newNotes[0] });
      for(let k=1;k<newNotes.length;k++){ updated=await DB.contractorUpdate(currentEditId,{ comment:newNotes[k] }); }
      const i=items.findIndex(x=>x.id===currentEditId); if(i>=0 && updated) items[i]=ensureIssueHistory(updated);
      render(); closeModal();
      toast('Update saved',{type:'success'});
    }catch(err){ toast(err.message||'Could not save update',{type:'info'}); }
  }
});
$('deleteItemBtn').addEventListener('click',async()=>{
  if(!currentEditId || !CAP('deleteItem')) return;
  const removed=items.find(i=>i.id===currentEditId);
  await DB.deleteItem(currentEditId);
  items=items.filter(i=>i.id!==currentEditId);
  renderRoomFilter(); render(); closeModal();
  toast('Item deleted',{type:'info', duration:6000, action:{label:'Undo', fn:async()=>{
    await DB.saveItem(removed); items.push(removed); renderRoomFilter(); render(); toast('Restored',{type:'success'});
  }}});
});

/* keyboard */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(!moreMenu.hasAttribute('hidden')) setMenu(false);
    else if($('lightbox').style.display==='flex') closeLightbox();
    else if($('itemModal').style.display==='flex') closeModal();
    else if($('projectModal').style.display==='flex') closeProjectModal();
    else if($('membersModal').style.display==='flex') $('membersModal').style.display='none';
    else if($('adminModal').style.display==='flex') $('adminModal').style.display='none';
  }
  if($('lightbox').style.display==='flex' && gallery.length>1){
    if(e.key==='ArrowLeft') $('lightboxPrev').click();
    if(e.key==='ArrowRight') $('lightboxNext').click();
  }
});

/* ---------- project / document banner ---------- */
function projectHasContent(p){
  return !!(p && (p.docTitle||p.docDescription||p.name||p.villa||p.location||p.client||p.preparedBy||p.ref||(p.photos&&p.photos.length)));
}
function renderProjectBanner(){
  const el=$('projectBanner'), p=project;
  const sub=document.querySelector('.subtitle');
  if(sub) sub.textContent='Track unfinished work · document · escalate';
  if(!projectHasContent(p)){
    const showPrompt = CAP('editProject') && currentProjectId;
    el.innerHTML = showPrompt ? `<div class="pb-empty">
      <div class="pe-text"><span class="pe-icon">${iconSvg('clipboard')}</span>
        <span><strong>Identify this report</strong><small>Add the project, villa &amp; document description — appears on every PDF export</small></span></div>
      <button class="btn btn-primary" id="addProjectBtn">${sIco('plus')}<span class="btn-label">Add Project Details</span></button>
    </div>` : '';
    if(showPrompt) $('addProjectBtn').onclick=openProjectModal;
    return;
  }
  const photos=p.photos||[];
  const cover=photos[0]||null;
  const field=(k,v)=> v?`<div class="pb-field"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`:'';
  const dateStr = p.date ? new Date(p.date+'T00:00:00').toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}) : '';
  el.innerHTML=`<div class="pb-card">
    ${cover ? (cover.isVideo?`<video class="pb-cover" src="${cover.src}" data-pcover></video>`:`<img class="pb-cover" src="${cover.src}" data-pcover alt="Project photo">`) : `<span class="pb-cover-ph">${iconSvg('clipboard','width="36" height="36"')}</span>`}
    <div class="pb-main">
      <div class="pb-top">
        <div style="min-width:0">
          <h2 class="pb-title">${esc(p.docTitle||'Punch List Report')}</h2>
          ${p.docDescription?`<p class="pb-desc">${esc(p.docDescription)}</p>`:''}
        </div>
        <button class="btn btn-outline pb-edit need-project" id="editProjectBtn">${sIco('edit')}<span class="btn-label">Edit</span></button>
      </div>
      <div class="pb-meta">
        ${field('Project',p.name)}${field('Villa / Unit',p.villa)}${field('Location',p.location)}
        ${field('Client',p.client)}${field('Prepared by',p.preparedBy)}${field('Date',dateStr)}${field('Ref',p.ref)}
      </div>
      ${photos.length>1?`<div class="pb-photos">${photos.slice(0,8).map((m,i)=>m.isVideo?`<video src="${m.src}" data-pi="${i}"></video>`:`<img src="${m.src}" data-pi="${i}" alt="">`).join('')}</div>`:''}
    </div>
  </div>`;
  $('editProjectBtn').onclick=openProjectModal;
  el.querySelector('[data-pcover]')?.addEventListener('click',()=>{ if(photos.length) openGallery(photos,0); });
  el.querySelectorAll('[data-pi]').forEach(n=>n.addEventListener('click',()=>openGallery(photos,parseInt(n.dataset.pi))));
  if(sub){ const bits=[p.villa,p.name].filter(Boolean); sub.textContent = bits.length?bits.join(' · '):'Track unfinished work · document · escalate'; }
}

function openProjectModal(){
  const p=project||{};
  $('pDocTitle').value=p.docTitle||'';
  $('pDocDesc').value=p.docDescription||'';
  $('pProject').value=p.name||'';
  $('pVilla').value=p.villa||'';
  $('pLocation').value=p.location||'';
  $('pClient').value=p.client||'';
  $('pBy').value=p.preparedBy||'';
  $('pDate').value=p.date||new Date().toISOString().slice(0,10);
  $('pRef').value=p.ref||'';
  tempProjectPhotos = p.photos?[...p.photos]:[];
  renderThumbs('pThumbs', tempProjectPhotos);
  $('clearProjectBtn').style.display = 'none';      // project always exists; no clear in multi-project model
  $('projectModal').style.display='flex';
  setTimeout(()=>$('pDocTitle').focus(),60);
}
function closeProjectModal(){ $('projectModal').style.display='none'; }
$('closeProjectBtn').addEventListener('click',closeProjectModal);
$('cancelProjectBtn').addEventListener('click',closeProjectModal);
$('projectModal').addEventListener('click',e=>{ if(e.target===$('projectModal')) closeProjectModal(); });
$('pPhotos').addEventListener('change',e=>{ addFiles(e.target.files,tempProjectPhotos,'pThumbs'); e.target.value=''; });
wireDrop('pPhotoDrop',()=>tempProjectPhotos,'pThumbs');

$('saveProjectBtn').addEventListener('click',async()=>{
  if(!currentProjectId){ toast('No project selected',{type:'info'}); return; }
  const base=project||{};
  project={
    id:currentProjectId, code:base.code, createdAt:base.createdAt||Date.now(),
    docTitle:$('pDocTitle').value.trim(),
    docDescription:$('pDocDesc').value.trim(),
    name:$('pProject').value.trim()||base.name||'Project',
    villa:$('pVilla').value.trim(),
    location:$('pLocation').value.trim(),
    client:$('pClient').value.trim(),
    preparedBy:$('pBy').value.trim(),
    date:$('pDate').value,
    ref:$('pRef').value.trim(),
    photos:tempProjectPhotos
  };
  await Projects.save(project);
  myProjectList=await Projects.mine(); buildSwitcher();
  renderProjectBanner(); closeProjectModal();
  toast('Project details saved',{type:'success'});
});

/* ---------- members & approvals ---------- */
function roleBadge(role){ return `<span class="m-role ${role}">${esc(role[0].toUpperCase()+role.slice(1))}</span>`; }
async function openMembers(){
  setMenu(false);
  const cur=myProjectList.find(p=>p.id===currentProjectId);
  $('membersTitle').textContent = cur?cur.name+' · members':'Members';
  $('membersCode').innerHTML = cur ? `Share this join code so consultants &amp; contractors can request access:
    <span class="code-chip">${esc(cur.code)} <button class="copy-code" title="Copy" data-code="${esc(cur.code)}">${iconSvg('copy','width="14" height="14"')}</button></span>` : '';
  const cc=$('membersCode').querySelector('.copy-code');
  if(cc) cc.onclick=()=>{ navigator.clipboard&&navigator.clipboard.writeText(cc.dataset.code); toast('Join code copied',{type:'success'}); };
  await renderMembersList();
  $('membersModal').style.display='flex';
}
async function renderMembersList(){
  const wrap=$('membersList'); wrap.innerHTML='<div class="m-loading">Loading…</div>';
  const mems = currentProjectId ? await Projects.membersOf(currentProjectId) : [];
  const pending=mems.filter(m=>m.status==='pending'), approved=mems.filter(m=>m.status==='approved');
  const me = Auth.user() && Auth.user().email;
  const canManage = IS_SUPER || CAP('manageMembers');
  const ownerCount = approved.filter(m=>m.role==='owner').length;

  const pendRow=m=>`<div class="m-row" data-id="${esc(m.id)}"><span class="m-avatar">${esc((m.email[0]||'?').toUpperCase())}</span><span class="m-info"><span class="m-email">${esc(m.email)}</span>${roleBadge(m.role)}</span><span class="m-actions"><button class="btn btn-primary sm" data-approve>Approve</button><button class="btn btn-danger sm" data-reject>Reject</button></span></div>`;
  const teamRow=m=>{
    const isSelf=m.email===me, editable=canManage && !isSelf;
    const actions = editable
      ? `<div class="select-wrap sm"><select class="m-role-select" data-id="${esc(m.id)}" data-role="${m.role}">
            <option value="owner" ${m.role==='owner'?'selected':''}>Owner</option>
            <option value="consultant" ${m.role==='consultant'?'selected':''}>Consultant</option>
            <option value="contractor" ${m.role==='contractor'?'selected':''}>Contractor</option>
          </select></div><button class="icon-btn sm" data-remove title="Remove member">${iconSvg('trash','width="16" height="16"')}</button>`
      : (isSelf?'<span class="m-owner-tag">You</span>':(m.role==='owner'?'<span class="m-owner-tag">Owner</span>':''));
    return `<div class="m-row" data-id="${esc(m.id)}"><span class="m-avatar">${esc((m.email[0]||'?').toUpperCase())}</span><span class="m-info"><span class="m-email">${esc(m.email)}</span>${editable?'':roleBadge(m.role)}</span><span class="m-actions">${actions}</span></div>`;
  };

  let html=`<div class="role-legend"><b>What each role can do</b><span><i class="rl owner"></i>Owner — full access + manage members &amp; project header</span><span><i class="rl consultant"></i>Consultant — add/edit items, status, comments, photos</span><span><i class="rl contractor"></i>Contractor — comments, expected date &amp; progress photos only</span></div>`;
  html+=`<div class="m-section"><div class="m-head">Pending requests ${pending.length?`<span class="m-count">${pending.length}</span>`:''}</div>`;
  html += pending.length ? pending.map(pendRow).join('') : '<div class="m-empty">No pending requests.</div>';
  html+=`</div><div class="m-section"><div class="m-head">Team ${approved.length?`<span class="m-count">${approved.length}</span>`:''} <span class="m-hint">change a role to change what they can edit</span></div>`;
  html += approved.length ? approved.map(teamRow).join('') : '<div class="m-empty">No approved members yet.</div>';
  html+='</div>';
  wrap.innerHTML=html;

  wrap.querySelectorAll('[data-approve]').forEach(b=>b.onclick=async()=>{ await Projects.setMembership(b.closest('.m-row').dataset.id,'approved'); toast('Approved',{type:'success'}); renderMembersList(); });
  wrap.querySelectorAll('[data-reject]').forEach(b=>b.onclick=async()=>{ await Projects.setMembership(b.closest('.m-row').dataset.id,'rejected'); toast('Request rejected',{type:'info'}); renderMembersList(); });
  wrap.querySelectorAll('[data-remove]').forEach(b=>b.onclick=async()=>{ if(confirm('Remove this member from the project?')){ await Projects.removeMembership(b.closest('.m-row').dataset.id); renderMembersList(); } });
  wrap.querySelectorAll('.m-role-select').forEach(sel=>sel.onchange=async()=>{
    const id=sel.dataset.id, oldRole=sel.dataset.role, newRole=sel.value;
    if(oldRole==='owner' && newRole!=='owner' && ownerCount<=1){ toast('Keep at least one owner on the project',{type:'info'}); sel.value='owner'; return; }
    try{ await Projects.setRole(id,newRole); toast('Role changed to '+newRole,{type:'success'}); renderMembersList(); }
    catch(err){ toast(err.message||'Could not change role',{type:'info'}); sel.value=oldRole; }
  });
}
$('membersBtn').addEventListener('click',openMembers);
$('closeMembersBtn').addEventListener('click',()=>$('membersModal').style.display='none');
$('membersModal').addEventListener('click',e=>{ if(e.target===$('membersModal')) $('membersModal').style.display='none'; });

/* ---------- super admin panel ---------- */
async function openAdmin(){
  setMenu(false);
  const body=$('adminBody'); body.innerHTML='<div class="m-loading">Loading…</div>';
  $('adminModal').style.display='flex';
  let pending=[],projects=[],users=[];
  try{ [pending,projects,users]=await Promise.all([Projects.pendingForAdmin(),Projects.allProjectsAdmin(),Projects.allUsers()]); }
  catch(err){ body.innerHTML=`<div class="m-empty">${esc(err.message)}</div>`; return; }
  let html=`<div class="m-section"><div class="m-head">Pending approvals ${pending.length?`<span class="m-count">${pending.length}</span>`:''}</div>`;
  html += pending.length ? pending.map(m=>`<div class="m-row" data-id="${esc(m.id)}"><span class="m-avatar">${esc((m.email[0]||'?').toUpperCase())}</span><span class="m-info"><span class="m-email">${esc(m.email)}</span><span class="m-sub">${roleBadge(m.role)} · ${esc(m.projectName||'')}</span></span><span class="m-actions"><button class="btn btn-primary sm" data-approve>Approve</button><button class="btn btn-danger sm" data-reject>Reject</button></span></div>`).join('') : '<div class="m-empty">Nothing pending across all projects.</div>';
  html+=`</div><div class="m-section"><div class="m-head">Projects <span class="m-count">${projects.length}</span></div>`;
  html += projects.length ? projects.map(p=>`<div class="m-row"><span class="m-avatar proj">${iconSvg('layers','width="16" height="16"')}</span><span class="m-info"><span class="m-email">${esc(p.name)}</span><span class="m-sub">code <b>${esc(p.code)}</b> · ${p.memberCount} member${p.memberCount!==1?'s':''} · ${p.itemCount} item${p.itemCount!==1?'s':''}</span></span></div>`).join('') : '<div class="m-empty">No projects yet.</div>';
  html+=`</div><div class="m-section"><div class="m-head">Users <span class="m-count">${users.length}</span></div>`;
  html += users.length ? users.map(u=>`<div class="m-row"><span class="m-avatar">${esc((u.email[0]||'?').toUpperCase())}</span><span class="m-info"><span class="m-email">${esc(u.email)}</span>${u.superAdmin?'<span class="m-role super">Super Admin</span>':''}</span></div>`).join('') : '<div class="m-empty">No users.</div>';
  html+='</div>';
  body.innerHTML=html;
  body.querySelectorAll('[data-approve]').forEach(b=>b.onclick=async()=>{ await Projects.setMembership(b.closest('.m-row').dataset.id,'approved'); toast('Approved',{type:'success'}); openAdmin(); });
  body.querySelectorAll('[data-reject]').forEach(b=>b.onclick=async()=>{ await Projects.setMembership(b.closest('.m-row').dataset.id,'rejected'); toast('Rejected',{type:'info'}); openAdmin(); });
}
$('adminBtn').addEventListener('click',openAdmin);
$('closeAdminBtn').addEventListener('click',()=>$('adminModal').style.display='none');
$('adminModal').addEventListener('click',e=>{ if(e.target===$('adminModal')) $('adminModal').style.display='none'; });

/* ---------- role permissions (super admin only) ---------- */
let _permWorking=null;
function openPermissions(){
  setMenu(false);
  _permWorking = JSON.parse(JSON.stringify(Permissions.current()));
  renderPermissions();
  $('permsModal').style.display='flex';
}
function renderPermissions(){
  const roles=[['owner','Owner'],['consultant','Consultant'],['contractor','Contractor']];
  let html=`<p class="perms-intro">Toggle what each role can do — applies to everyone with that role, across all projects. (Super Admin always has full access.)</p>`;
  html+=`<div class="perms-grid"><div class="perms-row perms-head"><div class="pc-cap"></div>${roles.map(r=>`<div class="pc-role ${r[0]}">${esc(r[1])}</div>`).join('')}</div>`;
  Permissions.caps.forEach(c=>{
    html+=`<div class="perms-row"><div class="pc-cap">${esc(c.label)}</div>${roles.map(r=>{
      const on=!!(_permWorking[r[0]]&&_permWorking[r[0]][c.key]);
      return `<div class="pc-cell"><button class="toggle ${on?'on':''}" data-role="${r[0]}" data-cap="${c.key}" role="switch" aria-checked="${on}" aria-label="${esc(c.label)} for ${esc(r[1])}"><span class="knob"></span></button></div>`;
    }).join('')}</div>`;
  });
  html+='</div>';
  $('permsBody').innerHTML=html;
  $('permsBody').querySelectorAll('.toggle').forEach(t=>t.onclick=async()=>{
    const role=t.dataset.role, cap=t.dataset.cap, prev=_permWorking[role][cap];
    _permWorking[role][cap]=prev?0:1;
    t.classList.toggle('on',!!_permWorking[role][cap]); t.setAttribute('aria-checked',_permWorking[role][cap]?'true':'false');
    try{ await Permissions.save(_permWorking); applyCaps(); render(); renderProjectBanner(); }
    catch(err){ _permWorking[role][cap]=prev; t.classList.toggle('on',!!prev); toast(err.message||'Could not save',{type:'info'}); }
  });
}
if($('permsBtn')&&$('permsModal')){
  $('permsBtn').addEventListener('click',openPermissions);
  $('permsResetBtn')?.addEventListener('click',async()=>{
    _permWorking=Permissions.defaults();
    try{ await Permissions.save(_permWorking); renderPermissions(); applyCaps(); render(); toast('Reset to defaults',{type:'success'}); }
    catch(err){ toast(err.message||'Could not reset',{type:'info'}); }
  });
  $('closePermsBtn')?.addEventListener('click',()=>$('permsModal').style.display='none');
  $('permsModal').addEventListener('click',e=>{ if(e.target===$('permsModal')) $('permsModal').style.display='none'; });
}
$('pendingSignOut').addEventListener('click',async()=>{ await Auth.signOut(); CURRENT_ROLE=null; IS_SUPER=false; currentProjectId=null; items=[]; project=null; myProjectList=[]; showAuth(); });

/* ---------- backup: export / import (.json with photos) ---------- */
const moreBtn=$('moreBtn'), moreMenu=$('moreMenu');
function setMenu(open){
  if(open){ moreMenu.removeAttribute('hidden'); moreBtn.setAttribute('aria-expanded','true'); }
  else{ moreMenu.setAttribute('hidden',''); moreBtn.setAttribute('aria-expanded','false'); }
}
moreBtn.addEventListener('click',e=>{ e.stopPropagation(); setMenu(moreMenu.hasAttribute('hidden')); });
document.addEventListener('click',e=>{ if(!moreMenu.hasAttribute('hidden') && !e.target.closest('.menu-wrap')) setMenu(false); });

function normalizeItem(raw){
  const st=['Not Done','Partially Done','Ready for Inspection','Completed'], pr=['High','Medium','Low'];
  return {
    id: raw.id || uid(),
    room: (raw.room||'').toString(),
    description: (raw.description||'').toString(),
    type: (raw.type||'General Construction').toString(),
    status: st.includes(raw.status)?raw.status:'Not Done',
    priority: pr.includes(raw.priority)?raw.priority:'Medium',
    contact: (raw.contact||'').toString(),
    expectedDate: raw.expectedDate||'',
    beforePhotos: Array.isArray(raw.beforePhotos)?raw.beforePhotos.filter(m=>m&&m.src):[],
    afterPhotos: Array.isArray(raw.afterPhotos)?raw.afterPhotos.filter(m=>m&&m.src):[],
    history: Array.isArray(raw.history)?raw.history.filter(h=>h&&h.text).map(h=>({date:h.date||Date.now(),text:h.text})):[],
    createdAt: raw.createdAt||Date.now(),
    updatedAt: raw.updatedAt||Date.now()
  };
}

$('exportBackupBtn').addEventListener('click',()=>{
  setMenu(false);
  if(!items.length && !projectHasContent(project)){ toast('Nothing to back up yet',{type:'info'}); return; }
  const data={ app:'site-punch-list', version:2, exportedAt:Date.now(), count:items.length, project, items };
  const blob=new Blob([JSON.stringify(data)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const d=new Date(), p=n=>String(n).padStart(2,'0');
  const a=document.createElement('a');
  a.href=url; a.download=`punch-list-backup-${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}.json`;
  a.click(); URL.revokeObjectURL(url);
  toast(`Backup saved · ${items.length} item${items.length!==1?'s':''}`,{type:'success'});
});

$('importBackupBtn').addEventListener('click',()=>{ setMenu(false); $('importFileInput').click(); });
$('importFileInput').addEventListener('change',e=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=async()=>{
    let data;
    try{ data=JSON.parse(reader.result); }
    catch{ toast('Could not read file — not valid backup JSON',{type:'info'}); return; }
    const incoming = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);
    const incomingProject = (!Array.isArray(data) && data && data.project && projectHasContent(data.project)) ? data.project : null;
    if(!incoming.length && !incomingProject){ toast('No items or project found in that file',{type:'info'}); return; }
    if(!currentProjectId){ toast('Open a project first, then import into it',{type:'info'}); return; }
    let added=0, updated=0;
    for(const raw of incoming){
      if(!raw || !raw.room) continue;
      const item=normalizeItem(raw); item.projectId=currentProjectId;   // import into the current project
      const idx=items.findIndex(x=>x.id===item.id);
      await DB.saveItem(item);
      if(idx>=0){ items[idx]=item; updated++; } else { items.push(item); added++; }
    }
    let projRestored=false;
    if(incomingProject && !projectHasContent(project)){
      const base=project||{};
      project={ id:currentProjectId, code:base.code, createdAt:base.createdAt||Date.now(),
        docTitle:incomingProject.docTitle||'', docDescription:incomingProject.docDescription||'', name:incomingProject.name||base.name||'Project',
        villa:incomingProject.villa||'', location:incomingProject.location||'', client:incomingProject.client||'',
        preparedBy:incomingProject.preparedBy||'', date:incomingProject.date||'', ref:incomingProject.ref||'', photos:incomingProject.photos||[] };
      await Projects.save(project); myProjectList=await Projects.mine(); buildSwitcher(); renderProjectBanner(); projRestored=true;
    }
    renderRoomFilter(); render();
    toast(`Imported · ${added} added, ${updated} updated${projRestored?' · project details':''}`,{type:'success', duration:4500});
  };
  reader.readAsText(file);
  e.target.value='';
});

/* ---------- PDF export (print) ---------- */
$('exportPdfBtn').addEventListener('click',()=>{
  const list=getFiltered();
  if(!list.length){ toast('Nothing to export with current filters',{type:'info'}); return; }
  const total=items.length, done=items.filter(i=>i.status==='Completed').length;
  const not=items.filter(i=>i.status==='Not Done').length, part=items.filter(i=>i.status==='Partially Done').length;
  const pct=total?Math.round(done/total*100):0;
  const sc={'Not Done':'background:#fdeaec;color:#b91c2c','Partially Done':'background:#fdf0db;color:#a55a08','Ready for Inspection':'background:#f7f8f1;color:#687148;border:1px solid #9ba47a','Completed':'background:#e4f6ea;color:#15803d'};
  const pc={High:'background:#fdeaec;color:#b91c2c',Medium:'background:#fdf0db;color:#a55a08',Low:'background:#dcf3f0;color:#0f766e'};
  const p=project;
  const coverP=(p&&p.photos&&p.photos.length)?p.photos.find(m=>!m.isVideo):null;
  let head=`<div class="pr-head">`;
  if(coverP) head+=`<img class="pr-cover" src="${coverP.src}">`;
  head+=`<h1>${esc((p&&p.docTitle)||'Site Punch List Report')}</h1>`;
  if(p&&p.docDescription) head+=`<div class="pr-doc-desc">${esc(p.docDescription)}</div>`;
  if(projectHasContent(p)){
    const pf=(k,v)=> v?`<span><b>${esc(k)}:</b> ${esc(v)}</span>`:'';
    const dateStr=p.date?new Date(p.date+'T00:00:00').toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}):'';
    head+=`<div class="pr-proj">${pf('Project',p.name)}${pf('Villa/Unit',p.villa)}${pf('Location',p.location)}${pf('Client',p.client)}${pf('Prepared by',p.preparedBy)}${pf('Ref',p.ref)}${dateStr?`<span><b>Date:</b> ${dateStr}</span>`:''}</div>`;
  }
  head+=`<div class="pr-meta">Report generated ${fmtDateTime()} &middot; ${list.length} item${list.length!==1?'s':''} shown</div></div>`;
  let html=head+`<div class="pr-summary">
      <div><b>${total}</b> total</div><div><b style="color:#15803d">${done}</b> completed</div>
      <div><b style="color:#a55a08">${part}</b> partial</div><div><b style="color:#b91c2c">${not}</b> not done</div>
      <div><b>${pct}%</b> complete</div>
    </div>`;
  list.forEach(it=>{
    const beforeImgs=(it.beforePhotos||[]).filter(m=>!m.isVideo);
    const afterImgs=(it.afterPhotos||[]).filter(m=>!m.isVideo);
    const vidCount=(it.beforePhotos||[]).concat(it.afterPhotos||[]).filter(m=>m.isVideo).length;
    let photos='';
    if(beforeImgs.length) photos+=`<div class="pr-ph-group"><div class="pr-ph-label">Original / problem (${beforeImgs.length})</div><div class="pr-photos">${beforeImgs.map(m=>`<img src="${m.src}">`).join('')}</div></div>`;
    if(afterImgs.length) photos+=`<div class="pr-ph-group"><div class="pr-ph-label">Updated / after (${afterImgs.length})</div><div class="pr-photos">${afterImgs.map(m=>`<img src="${m.src}">`).join('')}</div></div>`;
    if(vidCount) photos+=`<div class="pr-ph-note">+ ${vidCount} video attachment${vidCount>1?'s':''} — view in app</div>`;
    html+=`<div class="pr-row">
      <div class="pr-info">
        <div class="pr-room">${esc(it.room)}</div>
        <div style="margin:4px 0">
          <span class="pr-badge" style="${sc[it.status]||''}">${esc(statusLabel(it.status))}</span>
          <span class="pr-badge" style="${pc[it.priority]}">${esc(it.priority)} priority</span>
          <span class="pr-badge" style="background:#eef2f7;color:#475569">${esc(it.type)}</span>
        </div>
        <div>${esc(it.description)}</div>
        <div style="margin-top:3px"><b>Contacted:</b> ${esc(it.contact)||'—'}${it.expectedDate?` &nbsp;|&nbsp; <b>Expected:</b> ${esc(new Date(it.expectedDate+'T00:00:00').toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}))}`:''}</div>
        ${it.history&&it.history.length?`<div class="pr-log"><b>Log:</b> ${it.history.slice(0,4).map(h=>esc(h.text)+' ('+fmtDate(h.date)+')').join(' &middot; ')}</div>`:''}
      </div>
      ${photos?`<div class="pr-media">${photos}</div>`:''}
    </div>`;
  });
  $('printArea').innerHTML=html;
  window.print();
});

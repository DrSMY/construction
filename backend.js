/* ============================================================
   backend.js — Auth + Projects + Data (pluggable)
   Local (IndexedDB, offline) OR Supabase (cloud).
   Exposes globals: Backend, Auth, Projects, DB, Cloud, BACKEND_MODE, can()
   ============================================================ */
(function(){
  const CFG = window.PUNCHLIST_CONFIG || {};
  const SUPER_ADMIN_EMAIL = (CFG.SUPER_ADMIN_EMAIL||'').trim().toLowerCase();

  /* cloud credentials: in-app (localStorage) overrides config.js */
  function cloudCreds(){
    try{ const s=JSON.parse(localStorage.getItem('punchlist_cloud')||'null'); if(s&&s.url&&s.key) return s; }catch(e){}
    if(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY) return { url:CFG.SUPABASE_URL, key:CFG.SUPABASE_ANON_KEY };
    return null;
  }
  const CREDS = cloudCreds();
  const USE_SUPABASE = !!(CREDS && /^https?:\/\//.test(CREDS.url));
  window.BACKEND_MODE = USE_SUPABASE ? 'cloud' : 'local';

  /* ---------- configurable capabilities (super-admin editable) ---------- */
  const CAPS = [
    { key:'addItem',       label:'Add items' },
    { key:'editItem',      label:'Edit item details' },
    { key:'deleteItem',    label:'Remove items' },
    { key:'setStatus',     label:'Change work status' },
    { key:'afterPhotos',   label:'Upload progress photos' },
    { key:'comment',       label:'Add comments' },
    { key:'expectedDate',  label:'Set expected date' },
    { key:'editProject',   label:'Edit project header' },
    { key:'manageMembers', label:'Manage & approve members' },
    { key:'importBackup',  label:'Import backups' }
  ];
  const DEFAULT_PERMS = {
    owner:      { addItem:1, editItem:1, deleteItem:1, setStatus:1, afterPhotos:1, comment:1, expectedDate:1, editProject:1, manageMembers:1, importBackup:1 },
    consultant: { addItem:1, editItem:1, deleteItem:1, setStatus:1, afterPhotos:1, comment:1, expectedDate:1, editProject:0, manageMembers:0, importBackup:0 },
    contractor: { addItem:0, editItem:0, deleteItem:0, setStatus:0, afterPhotos:1, comment:1, expectedDate:1, editProject:0, manageMembers:0, importBackup:0 }
  };
  const clone = o => JSON.parse(JSON.stringify(o));
  function mergePerms(stored){
    const out = clone(DEFAULT_PERMS);
    if(stored) for(const r of ['owner','consultant','contractor']) if(stored[r]) for(const c of CAPS) if(c.key in stored[r]) out[r][c.key] = stored[r][c.key]?1:0;
    return out;
  }
  let _perms = clone(DEFAULT_PERMS);
  function can(role, action, isSuper){ if(isSuper) return true; return !!(_perms[role] && _perms[role][action]); }
  window.can = can;

  let _user=null;                 // {email, superAdmin}
  const listeners=[];
  function notify(){ listeners.forEach(fn=>{ try{ fn(_user); }catch(e){} }); }
  const lc = s => (s||'').trim().toLowerCase();
  const genCode = ()=> Array.from({length:6},()=>'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*31)]).join('');
  const newPid = ()=> 'p_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);

  /* ============================================================
     LOCAL backend
     ============================================================ */
  const Local = (function(){
    const DB_NAME='punchListDB', V=4; let db;
    function open(){
      return new Promise((res,rej)=>{
        const r=indexedDB.open(DB_NAME,V);
        r.onupgradeneeded=e=>{
          const d=e.target.result;
          if(!d.objectStoreNames.contains('items'))       d.createObjectStore('items',{keyPath:'id'});
          if(!d.objectStoreNames.contains('meta'))        d.createObjectStore('meta',{keyPath:'key'});
          if(!d.objectStoreNames.contains('users'))       d.createObjectStore('users',{keyPath:'email'});
          if(!d.objectStoreNames.contains('projects'))    d.createObjectStore('projects',{keyPath:'id'});
          if(!d.objectStoreNames.contains('memberships')) d.createObjectStore('memberships',{keyPath:'id'});
        };
        r.onsuccess=e=>{ db=e.target.result; res(); };
        r.onerror=e=>rej(e);
      });
    }
    const all=s=>new Promise(r=>{ const q=db.transaction(s,'readonly').objectStore(s).getAll(); q.onsuccess=()=>r(q.result||[]); });
    const get=(s,k)=>new Promise(r=>{ const q=db.transaction(s,'readonly').objectStore(s).get(k); q.onsuccess=()=>r(q.result||null); });
    const put=(s,v)=>new Promise(r=>{ const t=db.transaction(s,'readwrite'); t.objectStore(s).put(v); t.oncomplete=()=>r(); });
    const del=(s,k)=>new Promise(r=>{ const t=db.transaction(s,'readwrite'); t.objectStore(s).delete(k); t.oncomplete=()=>r(); });
    async function sha(str){ const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str)); return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join(''); }
    const salt=()=>crypto.getRandomValues(new Uint8Array(8)).join('');
    const SKEY='punchlist_session';

    async function migrateLegacy(){
      const projs=await all('projects');
      if(projs.length) return;
      const its=await all('items');
      if(!its.length) return;
      const meta=await get('meta','project')||{};
      const proj={ id:'p_legacy', code:genCode(), name:meta.name||'Default Project',
        docTitle:meta.docTitle||'', docDescription:meta.docDescription||'', villa:meta.villa||'',
        location:meta.location||'', client:meta.client||'', preparedBy:meta.preparedBy||'',
        date:meta.date||'', ref:meta.ref||'', photos:meta.photos||[], createdAt:Date.now() };
      await put('projects',proj);
      for(const it of its){ if(!it.projectId){ it.projectId=proj.id; await put('items',it); } }
    }

    return {
      async init(){
        await open(); await migrateLegacy();
        try{ const s=JSON.parse(localStorage.getItem(SKEY)||'null'); if(s&&s.email) _user=s; }catch(e){}
        if(_user){ const u=await get('users',_user.email); if(!u) _user=null; else _user={email:u.email,superAdmin:!!u.superAdmin}; }
      },
      user(){ return _user; },
      async anyAccounts(){ return (await all('users')).length>0; },

      async signUp({email,password,role,projectName,projectCode}){
        email=lc(email);
        if(!email||!password) throw new Error('Email and password are required');
        if(password.length<4) throw new Error('Password must be at least 4 characters');
        if(await get('users',email)) throw new Error('An account with this email already exists');
        const isSuper = email===SUPER_ADMIN_EMAIL;
        const s=salt();
        await put('users',{ email, salt:s, hash:await sha(s+password), superAdmin:isSuper, createdAt:Date.now() });
        if(!isSuper){
          if(role==='owner'){
            const proj={ id:newPid(), code:genCode(), name:(projectName||'My Project').trim(), photos:[], createdAt:Date.now() };
            await put('projects',proj);
            await put('memberships',{ id:email+'@'+proj.id, email, projectId:proj.id, role:'owner', status:'approved', createdAt:Date.now() });
          } else {
            const proj=(await all('projects')).find(p=>p.code===lc(projectCode).toUpperCase());
            if(!proj){ await del('users',email); throw new Error('No project found for that code. Ask the project owner for the join code.'); }
            await put('memberships',{ id:email+'@'+proj.id, email, projectId:proj.id, role:(role==='consultant'?'consultant':'contractor'), status:'pending', createdAt:Date.now() });
          }
        }
        _user={email,superAdmin:isSuper}; localStorage.setItem(SKEY,JSON.stringify(_user)); notify(); return _user;
      },
      async signIn({email,password}){
        email=lc(email);
        let u=await get('users',email);
        if(!u && email===SUPER_ADMIN_EMAIL){ const s=salt(); u={email,salt:s,hash:await sha(s+password),superAdmin:true,createdAt:Date.now()}; await put('users',u); }
        if(!u) throw new Error('No account found for this email');
        if(await sha(u.salt+password)!==u.hash) throw new Error('Incorrect password');
        _user={email:u.email,superAdmin:!!u.superAdmin}; localStorage.setItem(SKEY,JSON.stringify(_user)); notify(); return _user;
      },
      async signOut(){ _user=null; localStorage.removeItem(SKEY); notify(); },

      /* projects + memberships */
      async myProjects(){
        const projs=await all('projects');
        if(_user.superAdmin) return projs.sort((a,b)=>a.createdAt-b.createdAt);
        const mems=(await all('memberships')).filter(m=>m.email===_user.email && m.status==='approved');
        const ids=new Set(mems.map(m=>m.projectId));
        return projs.filter(p=>ids.has(p.id)).sort((a,b)=>a.createdAt-b.createdAt);
      },
      async myMemberships(){ return (await all('memberships')).filter(m=>m.email===_user.email); },
      async roleIn(projectId){
        if(_user.superAdmin) return 'owner';
        const m=(await all('memberships')).find(x=>x.email===_user.email && x.projectId===projectId && x.status==='approved');
        return m?m.role:null;
      },
      async createProject(name){
        const proj={ id:newPid(), code:genCode(), name:(name||'New Project').trim(), photos:[], createdAt:Date.now() };
        await put('projects',proj);
        await put('memberships',{ id:_user.email+'@'+proj.id, email:_user.email, projectId:proj.id, role:'owner', status:'approved', createdAt:Date.now() });
        return proj;
      },
      async getProject(id){ return await get('projects',id); },
      async saveProject(p){ await put('projects',p); },
      async deleteProject(id){
        for(const it of (await all('items')).filter(i=>i.projectId===id)) await del('items',it.id);
        for(const m of (await all('memberships')).filter(x=>x.projectId===id)) await del('memberships',m.id);
        await del('projects',id);
      },
      async membersOf(projectId){
        const mems=(await all('memberships')).filter(m=>m.projectId===projectId);
        return mems.sort((a,b)=>(a.status>b.status?1:-1)||a.createdAt-b.createdAt);
      },
      async pendingForAdmin(){
        const mems=(await all('memberships')).filter(m=>m.status==='pending');
        const projs=await all('projects'); const pm={}; projs.forEach(p=>pm[p.id]=p);
        if(_user.superAdmin) return mems.map(m=>({...m, projectName:pm[m.projectId]?.name||'—'}));
        // owners: only their projects
        const mine=new Set((await all('memberships')).filter(x=>x.email===_user.email && x.role==='owner' && x.status==='approved').map(x=>x.projectId));
        return mems.filter(m=>mine.has(m.projectId)).map(m=>({...m, projectName:pm[m.projectId]?.name||'—'}));
      },
      async setMembership(id,status){ const m=await get('memberships',id); if(!m) return; m.status=status; await put('memberships',m); },
      async setMembershipRole(id,role){ if(!['owner','consultant','contractor'].includes(role)) throw new Error('Invalid role'); const m=await get('memberships',id); if(!m) return; m.role=role; await put('memberships',m); },
      async removeMembership(id){ await del('memberships',id); },
      async allUsers(){ return (await all('users')).map(u=>({email:u.email,superAdmin:!!u.superAdmin,createdAt:u.createdAt})); },
      async allProjectsAdmin(){
        const projs=await all('projects'); const mems=await all('memberships'); const its=await all('items');
        return projs.map(p=>({ ...p, memberCount:mems.filter(m=>m.projectId===p.id&&m.status==='approved').length, itemCount:its.filter(i=>i.projectId===p.id).length }));
      },

      /* items (scoped) */
      async listItems(projectId){ return (await all('items')).filter(i=>i.projectId===projectId); },
      async saveItem(item){ await put('items',item); return item; },
      async deleteItem(id){ await del('items',id); },
      async contractorUpdate(id,{comment,expectedDate,afterPhotos}){
        const it=await get('items',id); if(!it) throw new Error('Item not found');
        if(comment){ it.history=it.history||[]; it.history.unshift({date:Date.now(),text:comment,by:_user.email,role:'contractor'}); }
        if(expectedDate!==undefined) it.expectedDate=expectedDate;
        if(Array.isArray(afterPhotos)) it.afterPhotos=afterPhotos;
        it.updatedAt=Date.now(); await put('items',it); return it;
      },
      async loadPerms(){ const m=await get('meta','permissions'); _perms=mergePerms(m&&m.value); return _perms; },
      async savePerms(cfg){ if(!_user||!_user.superAdmin) throw new Error('Only the super admin can change permissions'); _perms=mergePerms(cfg); await put('meta',{ key:'permissions', value:_perms }); return _perms; }
    };
  })();

  /* ============================================================
     SUPABASE backend (cloud)
     ============================================================ */
  const Cloud = (function(){
    let sb=null;
    const toItem=r=>r&&({ id:r.id, projectId:r.project_id, room:r.room, description:r.description, type:r.type, status:r.status, priority:r.priority, contact:r.contact, expectedDate:r.expected_date, beforePhotos:r.before_photos||[], afterPhotos:r.after_photos||[], history:r.history||[], createdAt:r.created_at, updatedAt:r.updated_at });
    const toRow=i=>({ id:i.id, project_id:i.projectId, room:i.room, description:i.description, type:i.type, status:i.status, priority:i.priority, contact:i.contact, expected_date:i.expectedDate||null, before_photos:i.beforePhotos||[], after_photos:i.afterPhotos||[], history:i.history||[], updated_at:new Date().toISOString() });
    const toProj=r=>r&&({ id:r.id, code:r.code, name:r.name, docTitle:r.doc_title, docDescription:r.doc_description, villa:r.villa, location:r.location, client:r.client, preparedBy:r.prepared_by, date:r.report_date, ref:r.ref, photos:r.photos||[], createdAt:r.created_at });
    const projRow=p=>({ id:p.id, code:p.code, name:p.name, doc_title:p.docTitle||null, doc_description:p.docDescription||null, villa:p.villa||null, location:p.location||null, client:p.client||null, prepared_by:p.preparedBy||null, report_date:p.date||null, ref:p.ref||null, photos:p.photos||[] });
    async function loadProfile(session){
      const user = session && session.user;
      if(!user){ _user=null; return null; }
      const { data:p } = await sb.from('profiles').select('email,is_super_admin').eq('id',user.id).maybeSingle();
      _user={ email:(p&&p.email)||user.email, superAdmin:!!(p&&p.is_super_admin) }; return _user;
    }
    return {
      async init(){
        sb=window.supabase.createClient(CREDS.url,CREDS.key,{ auth:{ persistSession:true, autoRefreshToken:true } });
        // NOTE: never call auth.getUser()/getSession() inside this callback — it deadlocks. Defer + use the passed session.
        sb.auth.onAuthStateChange((event, session)=>{ setTimeout(()=>{ loadProfile(session).then(notify); }, 0); });
        const { data:{ session } } = await sb.auth.getSession();
        await loadProfile(session);
      },
      user(){ return _user; },
      async anyAccounts(){ return true; },
      async signUp({email,password,role,projectName,projectCode}){
        const { error } = await sb.auth.signUp({ email, password, options:{ data:{ requested_role:role||'contractor', project_name:projectName||null, project_code:(projectCode||'').toUpperCase()||null } } });
        if(error) throw new Error(error.message);
        const { data:d2, error:e2 } = await sb.auth.signInWithPassword({ email, password });
        if(e2) throw new Error('Account created. If email confirmation is on, confirm it then sign in.');
        await loadProfile(d2.session); return _user;
      },
      async signIn({email,password}){ const { data, error } = await sb.auth.signInWithPassword({ email, password }); if(error) throw new Error(error.message); await loadProfile(data.session); return _user; },
      async signOut(){ await sb.auth.signOut(); _user=null; notify(); },
      async myProjects(){ const { data, error } = await sb.rpc('my_projects'); if(error) throw new Error(error.message); return (data||[]).map(toProj); },
      async myMemberships(){ const { data } = await sb.from('memberships').select('*'); return data||[]; },
      async roleIn(projectId){ if(_user.superAdmin) return 'owner'; const { data } = await sb.from('memberships').select('role').eq('project_id',projectId).eq('status','approved').maybeSingle(); return data?data.role:null; },
      async createProject(name){ const { data, error } = await sb.rpc('create_project',{ p_name:name }); if(error) throw new Error(error.message); return toProj(Array.isArray(data)?data[0]:data); },
      async getProject(id){ const { data } = await sb.from('projects').select('*').eq('id',id).maybeSingle(); return toProj(data); },
      async saveProject(p){ const { error } = await sb.from('projects').upsert(projRow(p)); if(error) throw new Error(error.message); },
      async deleteProject(id){ const { error } = await sb.from('projects').delete().eq('id',id); if(error) throw new Error(error.message); },
      async membersOf(projectId){ const { data } = await sb.from('memberships').select('*').eq('project_id',projectId); return data||[]; },
      async pendingForAdmin(){ const { data, error } = await sb.rpc('pending_memberships'); if(error) throw new Error(error.message); return data||[]; },
      async setMembership(id,status){ const { error } = await sb.rpc('set_membership_status',{ p_id:id, p_status:status }); if(error) throw new Error(error.message); },
      async setMembershipRole(id,role){ const { error } = await sb.rpc('set_membership_role',{ p_id:id, p_role:role }); if(error) throw new Error(error.message); },
      async removeMembership(id){ const { error } = await sb.from('memberships').delete().eq('id',id); if(error) throw new Error(error.message); },
      async allUsers(){ const { data } = await sb.from('profiles').select('email,is_super_admin,created_at'); return (data||[]).map(u=>({email:u.email,superAdmin:u.is_super_admin,createdAt:u.created_at})); },
      async allProjectsAdmin(){ const { data, error } = await sb.rpc('admin_projects'); if(error) throw new Error(error.message); return data||[]; },
      async listItems(projectId){ const { data, error } = await sb.from('items').select('*').eq('project_id',projectId).order('updated_at',{ascending:false}); if(error) throw new Error(error.message); return (data||[]).map(toItem); },
      async saveItem(item){ const { data, error } = await sb.from('items').upsert(toRow(item)).select().single(); if(error) throw new Error(error.message); return toItem(data); },
      async deleteItem(id){ const { error } = await sb.from('items').delete().eq('id',id); if(error) throw new Error(error.message); },
      async contractorUpdate(id,{comment,expectedDate,afterPhotos}){ const { data, error } = await sb.rpc('contractor_update',{ p_item:id, p_comment:comment||null, p_expected_date:expectedDate||null, p_after_photos:Array.isArray(afterPhotos)?afterPhotos:null }); if(error) throw new Error(error.message); return toItem(data); },
      async loadPerms(){ try{ const { data } = await sb.from('app_settings').select('value').eq('key','permissions').maybeSingle(); _perms=mergePerms(data&&data.value); }catch(e){ _perms=clone(DEFAULT_PERMS); } return _perms; },
      async savePerms(cfg){ _perms=mergePerms(cfg); const { error } = await sb.from('app_settings').upsert({ key:'permissions', value:_perms, updated_at:new Date().toISOString() }); if(error) throw new Error(error.message); return _perms; }
    };
  })();

  const B = USE_SUPABASE ? Cloud : Local;

  window.Backend = B;
  window.Auth = {
    init:()=>B.init(), user:()=>B.user(),
    signUp:a=>B.signUp(a), signIn:a=>B.signIn(a), signOut:()=>B.signOut(),
    anyAccounts:()=>B.anyAccounts(), onChange:fn=>listeners.push(fn),
    isSuper:()=> !!(_user&&_user.superAdmin)
  };
  window.Projects = {
    mine:()=>B.myProjects(), myMemberships:()=>B.myMemberships(), roleIn:id=>B.roleIn(id),
    create:n=>B.createProject(n), get:id=>B.getProject(id), save:p=>B.saveProject(p), remove:id=>B.deleteProject(id),
    membersOf:id=>B.membersOf(id), pendingForAdmin:()=>B.pendingForAdmin(),
    setMembership:(id,s)=>B.setMembership(id,s), setRole:(id,r)=>B.setMembershipRole(id,r), removeMembership:id=>B.removeMembership(id),
    allUsers:()=>B.allUsers(), allProjectsAdmin:()=>B.allProjectsAdmin()
  };
  window.DB = {
    listItems:pid=>B.listItems(pid), saveItem:i=>B.saveItem(i), deleteItem:id=>B.deleteItem(id),
    contractorUpdate:(id,p)=>B.contractorUpdate(id,p)
  };
  window.Permissions = {
    caps: CAPS,
    defaults: ()=>clone(DEFAULT_PERMS),
    current: ()=>_perms,
    load: ()=>B.loadPerms(),
    save: (cfg)=>B.savePerms(cfg)
  };
  /* in-app cloud connection helper */
  window.Cloud = {
    creds:()=>cloudCreds(),
    save(url,key){ localStorage.setItem('punchlist_cloud',JSON.stringify({url:url.trim(),key:key.trim()})); },
    clear(){ localStorage.removeItem('punchlist_cloud'); },
    async test(url,key){
      if(!window.supabase) throw new Error('Supabase library not loaded (need internet).');
      if(!/^https?:\/\//.test(url)) throw new Error('URL should start with https://');
      const c=window.supabase.createClient(url.trim(),key.trim());
      const { error } = await c.from('projects').select('id').limit(1);
      if(error && !/permission|row-level|JWT|not authenticated/i.test(error.message)) throw new Error(error.message);
      return true;   // reachable (auth/RLS errors are fine — means it connected)
    }
  };
})();

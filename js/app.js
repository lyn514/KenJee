/* Ken Jee Hair Salon - app logic. Data is saved in this browser (localStorage). */
function localDb(){
 const K='kj_db',L=()=>{try{return JSON.parse(localStorage.getItem(K))||{}}catch(e){return{}}},S=d=>{try{localStorage.setItem(K,JSON.stringify(d))}catch(e){}};
 const subs=[],snap=c=>{const d=L()[c]||{};return{docs:Object.keys(d).map(id=>({id,exists:true,data:()=>d[id]}))}},fire=()=>subs.forEach(s=>s.fn(snap(s.c)));
 addEventListener('storage',fire);
 return{collection:c=>({
  onSnapshot(fn){subs.push({c,fn});setTimeout(()=>fn(snap(c)));return()=>{}},
  doc:id=>({
   async get(){const d=(L()[c]||{})[id];return{id,exists:!!d,data:()=>d}},
   async set(v){const a=L();(a[c]=a[c]||{})[id]=v;S(a);fire()},
   async update(v){const a=L();a[c]=a[c]||{};a[c][id]={...a[c][id],...v};S(a);fire()},
   async delete(){const a=L();if(a[c])delete a[c][id];S(a);fire()}})})}}
const BR={1:'1st Branch (Coral Bldg.)',2:'2nd Branch (North Zen Hotel Bldg.)'};
const MENU=[
{t:'Solo Rates',img:'images/menu1.jpg',items:[['Regular Color',900],['Balayage',2000],['Fashion Color',2300],['Organic Rebond',1500,1],['Regular Keratin',1000],['Haircut (Female)',300],['Haircut (Male)',300]]},
{t:'Package Rates',img:'images/menu2.jpg',items:[['Regular Color · Keratin · HC',2000],['Balayage · Keratin · HC',3000],['Fashion Color · Keratin · HC',3500],['Organic Rebond · Keratin · HC',2800],['Organic Rebond · Color · HC',2800],['Organic Rebond · Color · Keratin · HC',3600],['Regular Rebond · Color · Keratin · HC',3100],['Regular Rebond · Keratin · HC',2300]]},
{t:'Premium Treatments',img:'images/menu3.jpg',items:[['Intense Keratin',1500],['Organic Brazilian',3000,1],['Bamboo Blowout',3000,1],['Brazilian Blowout',4000,1],['Protein Straight Bond',3000,1],['Healing Scalp Treatment',2000],['Plarmia Scalp Treatment',2000],['Milbon Grand Linkage',1800]]}];
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const peso=n=>'₱'+n.toLocaleString('en-PH');
$('#menuGrid').innerHTML=MENU.map(m=>{const p=m.items.map(i=>i[1]);return `<div class="card mcard"><img src="${m.img}" alt="${m.t}"><div class="pad"><h3>${m.t}</h3><div class="range">${peso(Math.min(...p))} – ${peso(Math.max(...p))}</div>${m.items.map(i=>`<div class="row"><span>${esc(i[0])}${i[2]?'<small>depending on hair length</small>':''}</span><b>${peso(i[1])}</b></div>`).join('')}</div></div>`}).join('');
$('#menuBtn').onclick=()=>$('#links').classList.toggle('open');
$('#links').onclick=e=>{if(e.target.tagName=='A')$('#links').classList.remove('open')};
const today=new Date().toISOString().slice(0,10);
document.querySelectorAll('input[type=date]').forEach(d=>d.min=today);
let db=null,uid=null,isAdmin=false,RES=[],OB=[],PR=[];
const fmtD=d=>new Date(d+'T00:00').toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
const fmtT=t=>{const[h,m]=t.split(':');return((h%12)||12)+':'+m+(h<12?' AM':' PM')};
const isFull=(b,d)=>OB.some(o=>o.date==d&&(o.branch==b||o.branch=='all'));
function renderStatus(){[1,2].forEach(b=>{const e=document.querySelector(`[data-status="${b}"]`),f=OB.filter(o=>o.date>=today&&(o.branch==b||o.branch=='all')).map(o=>o.date).sort();
 e.className='badge '+(f.length?'bad':'ok');e.textContent=f.length?'Fully booked: '+f.slice(0,3).map(fmtD).join(', ')+(f.length>3?'…':''):'Open for booking'})}
function checkForm(){const f=$('#resForm'),m=$('#resMsg'),b=f.branch.value,d=f.date.value;
 if(d&&isFull(b,d)){m.className='note bad';m.textContent=`${BR[b]} is fully booked on ${fmtD(d)}. Please pick another date or branch.`}else{m.className='note hide'}}
$('#resForm').onchange=checkForm;
function renderPromos(){const el=$('#promoList');el.innerHTML=PR.length?PR.sort((a,b)=>b.at-a.at).map(p=>`<div class="card"><div class="pad"><span class="badge">${esc(p.kind)}</span><h3 style="margin-top:8px">${esc(p.title)}</h3><p>${esc(p.body)}</p></div></div>`).join(''):'<p style="text-align:center;color:var(--mute);grid-column:1/-1">No promos posted yet — check back soon.</p>'}
const bd=s=>`<span class="badge ${s=='accepted'?'ok':s=='declined'?'bad':'wait'}">${s}</span>`;
function renderRes(){
 const mine=RES.filter(r=>r.uid==uid).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 $('#myRes').innerHTML=mine.length?mine.map(r=>`<div class="item"><div><b>${fmtD(r.date)} · ${fmtT(r.time)}</b><br><small>${esc(BR[r.branch])}${r.service?' · '+esc(r.service):''}</small>${r.reply?`<br><small>Salon: ${esc(r.reply)}</small>`:''}</div>${bd(r.status)}</div>`).join(''):'<p style="color:var(--mute)">Nothing yet.</p>';
 if(!isAdmin)return;
 const all=[...RES].sort((a,b)=>(a.status=='pending'?0:1)-(b.status=='pending'?0:1)||(a.date+a.time).localeCompare(b.date+b.time));
 $('#adminRes').innerHTML=all.length?all.map(r=>`<div class="item"><div><b>${esc(r.name)}</b> <small>@${esc(r.uid)}</small> ${bd(r.status)}<br><small>${fmtD(r.date)} · ${fmtT(r.time)} · ${esc(BR[r.branch])}${r.service?' · '+esc(r.service):''}</small></div><div class="acts"><button class="btn sm yes" data-a="accepted" data-id="${r.id}">Accept</button><button class="btn sm no" data-a="declined" data-id="${r.id}">Decline</button></div></div>`).join(''):'<p style="color:var(--mute)">No reservations yet.</p>';
 $('#obList').innerHTML=OB.sort((a,b)=>a.date.localeCompare(b.date)).map(o=>`<div class="item"><span>${fmtD(o.date)} · ${o.branch=='all'?'Both branches':BR[o.branch]}</span><button class="btn sm no" data-ob="${o.id}">Remove</button></div>`).join('');
 $('#prAdmin').innerHTML=PR.map(p=>`<div class="item"><span>${esc(p.title)}</span><button class="btn sm no" data-pr="${p.id}">Delete</button></div>`).join('');
}
const rid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
(async()=>{
 db=localDb();
 if(!db){$('#dbWarn').classList.remove('hide');renderPromos();return}
 restore();
 db.collection('reservations').onSnapshot(s=>{RES=s.docs.map(d=>({id:d.id,...d.data()}));renderRes()},()=>{});
 db.collection('overbooked').onSnapshot(s=>{OB=s.docs.map(d=>({id:d.id,...d.data()}));renderStatus();renderRes();checkForm()},()=>{});
 db.collection('promos').onSnapshot(s=>{PR=s.docs.map(d=>({id:d.id,...d.data()}));renderPromos();renderRes()},()=>{});
})();
renderPromos();
const ADMIN_CODE='KENJEE-ADMIN';
let me=null,mode='login';
async function hash(p,s){if(!(window.crypto&&crypto.subtle)){let x=5381;for(const c of s+':'+p)x=((x<<5)+x+c.charCodeAt(0))>>>0;return 'x'+x}const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s+':'+p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function setMe(a){me=a;uid=a?a.username:null;isAdmin=!!a&&a.role=='admin';
 try{a?localStorage.setItem('kj_user',a.username):localStorage.removeItem('kj_user')}catch(e){}
 $('#admin').classList.toggle('hide',!isAdmin);$('#reserve').classList.toggle('hide',isAdmin);document.querySelectorAll('a[href="#reserve"]').forEach(e=>e.classList.toggle('hide',isAdmin));$('#adminLink').classList.toggle('hide',!isAdmin);
 $('#authLink').textContent=a?'Log out ('+a.username+')':'Log in';
 const n=document.querySelector('#resForm [name=name]');if(a&&n&&!n.value)n.value=a.fullname||'';renderRes()}
async function restore(){let u=null;try{u=localStorage.getItem('kj_user')}catch(e){}if(!u)return;try{const s=await db.collection('accounts').doc(u).get();if(s.exists)setMe({username:u,...s.data()})}catch(e){}}
function showAuth(on){$('#home').classList.toggle('auth-open',on);if(on)window.scrollTo({top:0,behavior:'smooth'})}
addEventListener('keydown',e=>{if(e.key=='Escape')showAuth(false)});
function openAuth(m){mode=m;const F=$('#authForm');$('#tLogin').className=m=='login'?'on':'';$('#tSign').className=m=='sign'?'on':'';
 $('#fName').classList.toggle('hide',m!='sign');F.fullname.required=m=='sign';$('#authGo').textContent=m=='sign'?'Create account':'Log in';
 F.password.autocomplete=m=='sign'?'new-password':'current-password';syncCode();$('#authMsg').className='note hide';showAuth(true)}
function syncCode(){const a=$('#authForm').role.value=='admin'&&mode=='sign';$('#fCode').classList.toggle('hide',!a)}
$('#authLink').onclick=e=>{e.preventDefault();$('#links').classList.remove('open');me?setMe(null):openAuth('login')};
$('#tLogin').onclick=()=>openAuth('login');$('#tSign').onclick=()=>openAuth('sign');$('#authX').onclick=()=>showAuth(false);
$('#authForm').onchange=syncCode;
$('#authForm').onsubmit=async e=>{e.preventDefault();const F=e.target,m=$('#authMsg'),say=t=>{m.className='note bad';m.textContent=t};
 if(!db)return say('Accounts are unavailable. Open this page signed in to Claude.');
 const un=F.username.value.trim().toLowerCase(),pw=F.password.value,role=F.role.value;
 if(!/^[a-z0-9_]{3,20}$/.test(un))return say('Username: 3–20 letters, numbers or underscores.');
 try{const ref=db.collection('accounts').doc(un),s=await ref.get();
 if(mode=='sign'){
  if(s.exists)return say('That username is already taken.');
  if(role=='admin'&&F.code.value!==ADMIN_CODE)return say('Wrong admin access code.');
  const salt=rid(),a={fullname:F.fullname.value.trim(),role,salt,hash:await hash(pw,salt)};
  await ref.set(a);setMe({username:un,...a})
 }else{
  if(!s.exists)return say('No account with that username.');
  const d=s.data();if(d.hash!==await hash(pw,d.salt))return say('Incorrect password.');
  if(d.role!==role)return say('This is a '+d.role+' account. Switch the Client/Admin option.');
  setMe({username:un,...d})}
 F.reset();showAuth(false);
 if(isAdmin)location.hash='admin'
 }catch(x){say('Something went wrong. Please try again.')}};
$('#resForm').onsubmit=async e=>{e.preventDefault();const f=e.target,m=$('#resMsg');
 if(!db)return;if(!uid){openAuth('login');return}
 if(isFull(f.branch.value,f.date.value)){checkForm();return}
 const id=rid();
 try{await db.collection('reservations').doc(id).set({uid,name:f.name.value.trim(),branch:f.branch.value,date:f.date.value,time:f.time.value,service:f.service.value.trim(),status:'pending',reply:'',at:Date.now()});
 m.className='note';m.textContent='Reservation sent! Status: pending until the salon responds.';f.reset()}
 catch(err){m.className='note bad';m.textContent='Could not send. Please try again.'}};
document.addEventListener('click',async e=>{const t=e.target;if(!db||!isAdmin)return;
 try{
 if(t.dataset.a){const reply=t.dataset.a=='accepted'?'See you!':(prompt('Reason / alternative time (optional)')||'');await db.collection('reservations').doc(t.dataset.id).update({status:t.dataset.a,reply})}
 if(t.dataset.ob)await db.collection('overbooked').doc(t.dataset.ob).delete();
 if(t.dataset.pr)await db.collection('promos').doc(t.dataset.pr).delete()}catch(x){}});
$('#obForm').onsubmit=async e=>{e.preventDefault();const f=e.target;await db.collection('overbooked').doc(rid()).set({branch:f.branch.value,date:f.date.value});f.reset()};
$('#prForm').onsubmit=async e=>{e.preventDefault();const f=e.target;await db.collection('promos').doc(rid()).set({title:f.title.value.trim(),body:f.body.value.trim(),kind:f.kind.value,at:Date.now()});f.reset()};

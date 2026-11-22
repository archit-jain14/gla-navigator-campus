const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const LS=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch{return d}};
const SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
LS('gla_custom',[]).forEach(c=>PLACES.push(c));
const P=PLACES, byId=id=>P.find(p=>p.id===id);
let edits=LS('gla_edits',{}); P.forEach(p=>{const e=edits[p.id];if(e){p.lat=e[0];p.lng=e[1];p.verified=true;p.user=true}});
let favs=LS('gla_favs',[]).filter(id=>byId(id)), recents=LS('gla_recents',[]).filter(id=>byId(id)), userPos=null, manualPos=null, pickMode=false, cat='all', mapCat='all', editMode=false;
const mk={}, hav=(a,b)=>{const R=6371000,r=x=>x*Math.PI/180,dl=r(b.lat-a.lat),dn=r(b.lng-a.lng);const h=Math.sin(dl/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
const bearing=(a,b)=>{const r=x=>x*Math.PI/180,y=Math.sin(r(b.lng-a.lng))*Math.cos(r(b.lat)),x=Math.cos(r(a.lat))*Math.sin(r(b.lat))-Math.sin(r(a.lat))*Math.cos(r(b.lat))*Math.cos(r(b.lng-a.lng));return(Math.atan2(y,x)*180/Math.PI+360)%360};
const compass=b=>['north','north-east','east','south-east','south','south-west','west','north-west'][Math.round(b/45)%8];
const badge=p=>p.verified?`<span class="tag ok">${p.user?'Position surveyed':'Verified'}</span>`:p.f?'<span class="tag">Facility confirmed · position sample</span>':'<span class="tag">Unconfirmed · sample</span>';

// Tabs
function tab(t){$$('.tab').forEach(e=>e.classList.toggle('on',e.id===t));$$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
 setTimeout(()=>{map.invalidateSize();rmap.invalidateSize()},50);scrollTo(0,0)}
$$('#tabs button').forEach(b=>b.onclick=()=>tab(b.dataset.t));

// Chips
function chips(el,get,set){el.innerHTML=[['all',['All','✨']],...Object.entries(CATS)].map(([k,v])=>`<button data-k="${k}" class="${get()===k?'on':''}">${v[1]||''} ${v[0]}</button>`).join('');
 el.querySelectorAll('button').forEach(b=>b.onclick=()=>{set(b.dataset.k);chips(el,get,set)})}
// Cards
function card(p){const f=favs.includes(p.id),c=CATS[p.cat];return `<div class="card"><div class="ic" style="background:${c[2]}22">${c[1]}</div><div><b>${p.name}</b><br><small>${c[0]} ${badge(p)}</small><p>${p.desc}</p><div class="acts"><button onclick="showOnMap('${p.id}')">Map</button><button onclick="goRoute('${p.id}')">Directions</button><button onclick="toggleFav('${p.id}')">${f?'★':'☆'}</button></div></div></div>`}
function search(){const q=$('#q').value.trim().toLowerCase(),toks=q.split(/\s+/).filter(Boolean);
 const r=P.filter(p=>(cat==='all'||p.cat===cat)&&toks.every(t=>(p.name+' '+CATS[p.cat][0]+' '+p.desc+' '+(p.kw||'')).toLowerCase().includes(t)));
 $('#results').innerHTML=(q||cat!=='all')?(r.map(card).join('')||'<p>No matching place. Try another word or category.</p>'):'';}
$('#q').oninput=search;
function addRecent(id){recents=[id,...recents.filter(x=>x!==id)].slice(0,6);SV('gla_recents',recents);lists()}
function toggleFav(id){favs=favs.includes(id)?favs.filter(x=>x!==id):[...favs,id];SV('gla_favs',favs);lists();search()}
function lists(){const l=a=>a.length?a.map(id=>`<button onclick="showOnMap('${id}')">${CATS[byId(id).cat][1]} ${byId(id).name}</button>`).join(''):'<small>Nothing yet.</small>';
 $('#favs').innerHTML=l(favs);$('#recents').innerHTML=l(recents);
 $('#emerg').innerHTML=P.filter(p=>p.emergency).map(p=>`<button onclick="goRoute('${p.id}')">🚨 ${p.name} — get directions</button>`).join('')}
$('#quick').innerHTML=['library','food','hostel','academic','medical','parking','sports','lab'].map(k=>`<button data-k="${k}"><span>${CATS[k][1]}</span>${CATS[k][0]}</button>`).join('');
$$('#quick button').forEach(b=>b.onclick=()=>{cat=b.dataset.k;chips($('#chips'),()=>cat,s=>{cat=s;search()});search();$('#results').scrollIntoView({behavior:'smooth'})});
$('#popular').innerHTML=['lb','ca','iet','hb','md','au'].map(id=>card(byId(id))).join('');

// Maps
const mkMap=id=>{const m=L.map(id,{maxZoom:20}).setView(CENTER,17);const o=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:20,maxNativeZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(m);
 const s=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:20,maxNativeZoom:19,attribution:'Tiles © Esri'});L.control.layers({'Street':o,'Satellite':s}).addTo(m);return m};
const map=mkMap('mapEl'), rmap=mkMap('routeMap'); let routeLayer=L.layerGroup().addTo(rmap), userMk=null;
L.circle(CENTER,{radius:350,color:'#0f2a5c',weight:1,fillOpacity:.04}).addTo(map).bindTooltip('Verified campus centre (approx. area)');
function drawMarkers(){Object.values(mk).forEach(m=>map.removeLayer(m));
 P.filter(p=>mapCat==='all'||p.cat===mapCat).forEach(p=>{const c=CATS[p.cat],ic=L.divIcon({className:'',html:`<div class="pin ${p.verified?'':'s'}" style="background:${c[2]}">${c[1]}</div>`,iconSize:[32,32],iconAnchor:[16,16]});
  const m=L.marker([p.lat,p.lng],{icon:ic,draggable:editMode,title:p.name}).addTo(map);
  m.bindPopup(()=>`<b>${p.name}</b><br>${c[0]} ${badge(p)}<p>${p.desc}</p><button class="btn sm" onclick="setFrom('${p.id}')">From here</button> <button class="btn sm" onclick="goRoute('${p.id}')">Go here</button> <button class="btn sm ghost" onclick="toggleFav('${p.id}')">${favs.includes(p.id)?'★ Saved':'☆ Save'}</button>${editMode?`<br><button class="btn sm" onclick="setGps('${p.id}')">📍 Set to my GPS position</button>${p.custom?`<button class="btn sm ghost" onclick="delCustom('${p.id}')">🗑 Delete</button>`:''}`:''}`);
  m.on('click',()=>addRecent(p.id));
  m.on('dragend',()=>{const ll=m.getLatLng();p.lat=ll.lat;p.lng=ll.lng;p.verified=p.user=true;edits[p.id]=[ll.lat,ll.lng];SV('gla_edits',edits);drawMarkers();status()});
  mk[p.id]=m})}
chips($('#mapChips'),()=>mapCat,s=>{mapCat=s;drawMarkers()});
$('#edit').onchange=e=>{editMode=e.target.checked;$('#export').hidden=$('#resetEdits').hidden=$('#addHere').hidden=$('#addGps').hidden=!editMode;drawMarkers()};
$('#export').onclick=()=>dl('gla-corrected-locations.json',P.filter(p=>p.user).map(({id,name,cat,desc,lat,lng,custom})=>({id,name,cat,desc,lat,lng,custom})));
$('#resetEdits').onclick=()=>{if(confirm('Remove all your position edits and reload?')){SV('gla_edits',{});SV('gla_custom',[]);location.reload()}};
function showOnMap(id){const p=byId(id);addRecent(id);mapCat='all';chips($('#mapChips'),()=>mapCat,s=>{mapCat=s;drawMarkers()});drawMarkers();tab('map');map.setView([p.lat,p.lng],19);setTimeout(()=>mk[id].openPopup(),300)}
map.on('click',e=>pickedFromMap(e));rmap.on('click',e=>pickedFromMap(e));
function pickedFromMap(e){if(addMode){addMode=false;newPlace(e.latlng.lat,e.latlng.lng);return}if(!pickMode)return;pickMode=false;manualPos={id:'map',name:'Point I tapped',lat:e.latlng.lat,lng:e.latlng.lng};$('#from').value='map';tab('route');calc()}

// Location
function setUser(lat,lng,acc){userPos={id:'gps',name:'My GPS location',lat,lng};const far=hav(userPos,{lat:CENTER[0],lng:CENTER[1]})>2000;
 $('#locText').innerHTML=`📍 GPS fix (±${Math.round(acc)} m).`+(far?' <span class="warn">You appear to be outside the campus, so routes will be long.</span>':'');
 userMk&&map.removeLayer(userMk);userMk=L.circleMarker([lat,lng],{radius:8,color:'#fff',fillColor:'#2563eb',fillOpacity:1,weight:3}).addTo(map).bindTooltip('You are here');$('#from').value='gps';calc()}
function gps(){if(!navigator.geolocation){alert('GPS not supported here. Choose a starting point manually.');return}
 navigator.geolocation.getCurrentPosition(p=>setUser(p.coords.latitude,p.coords.longitude,p.coords.accuracy),e=>{$('#locText').innerHTML='<span class="warn">Location unavailable ('+e.message+'). Pick your starting point manually below.</span>'},{enableHighAccuracy:true,timeout:10000})}
$('#gpsBtn').onclick=gps;$('#gps2').onclick=gps;$('#pickMap').onclick=()=>{pickMode=true;alert('Now tap your position on the Map or the route map.');}
const opts=P.map(p=>`<option value="${p.id}">${CATS[p.cat][1]} ${p.name}</option>`).join('');
$('#manualLoc').innerHTML='<option value="">— or choose where you are —</option>'+opts;
$('#manualLoc').onchange=e=>{if(e.target.value){setFrom(e.target.value);$('#locText').textContent='Starting point: '+byId(e.target.value).name}};
$('#from').innerHTML='<option value="">Select start…</option><option value="gps">📍 My GPS location</option><option value="map">👆 Point I tapped on map</option>'+opts;
$('#to').innerHTML='<option value="">Select destination…</option>'+opts;
const pt=v=>v==='gps'?userPos:v==='map'?manualPos:byId(v);
function setFrom(id){$('#from').value=id;tab('route');calc()}
function goRoute(id){addRecent(id);$('#to').value=id;tab('route');calc()}
$('#from').onchange=$('#to').onchange=calc;$('#swap').onclick=()=>{const a=$('#from').value;$('#from').value=$('#to').value;$('#to').value=a;calc()};

// Route (straight-line estimate; no road/path graph is available)
function calc(){const a=pt($('#from').value),b=pt($('#to').value),o=$('#routeOut');routeLayer.clearLayers();
 if(!a||!b){o.textContent=($('#from').value==='gps'&&!a)?'Waiting for GPS… press “Use GPS”.':'Choose a start and a destination.';return}
 if(a===b){o.textContent='Start and destination are the same.';return}
 const dist=hav(a,b),mins=Math.max(1,Math.round(dist*1.3/1.34/60)),sure=(a.verified||a.id==='gps'||a.id==='map')&&b.verified;
 L.polyline([[a.lat,a.lng],[b.lat,b.lng]],{color:'#2563eb',weight:5,dashArray:'8 8'}).addTo(routeLayer);
 L.marker([a.lat,a.lng]).addTo(routeLayer).bindTooltip('Start: '+a.name);L.marker([b.lat,b.lng]).addTo(routeLayer).bindTooltip('Destination: '+b.name);
 rmap.fitBounds([[a.lat,a.lng],[b.lat,b.lng]],{padding:[40,40]});
 const mid={lat:(a.lat+b.lat)/2,lng:(a.lng+b.lng)/2},near=P.filter(p=>p!==a&&p!==b).map(p=>[p,hav(mid,p)]).sort((x,y)=>x[1]-y[1])[0];
 const steps=[`Start at <b>${a.name}</b>.`,`Head <b>${compass(bearing(a,b))}</b> for about <b>${Math.round(dist)} m</b> (straight line).`];
 if(near&&near[1]<150)steps.push(`You should pass near <b>${near[0].name}</b>.`);
 steps.push(`Arrive at <b>${b.name}</b>. Ask a nearby person or sign for the exact entrance or floor.`);
 o.innerHTML=`<p><b>${Math.round(dist)} m</b> straight line · about <b>${mins} min</b> walk (estimate with 30% detour allowance) ${sure?'':'<span class="tag">Based on sample positions</span>'}</p><ol>${steps.map(s=>`<li>${s}</li>`).join('')}</ol>
 <button class="btn" onclick="window.open('https://www.google.com/maps/dir/?api=1&origin=${a.lat},${a.lng}&destination=${b.lat},${b.lng}&travelmode=walking')">🧭 Get Directions (Google Maps)</button>
 <p class="note">Limits: no campus footpath map is loaded, so the line ignores walls and paths. Indoor positioning is not supported.</p>`}

// Feedback, info, status
$('#fbPlace').innerHTML='<option value="">(general)</option>'+opts;
$('#fbSend').onclick=()=>{const t=$('#fbText').value.trim();if(!t){$('#fbMsg').textContent='Please write something first.';return}
 SV('gla_feedback',[...LS('gla_feedback',[]),{time:new Date().toISOString(),type:$('#fbType').value,place:$('#fbPlace').value,text:t}]);$('#fbText').value='';$('#fbMsg').textContent='Saved on this device. Thank you!'};
function dl(n,o){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,2)],{type:'application/json'}));a.download=n;a.click()}
$('#fbDl').onclick=()=>dl('gla-feedback.json',LS('gla_feedback',[]));
$('#info').innerHTML=`<p><b>Address:</b> ${INFO.address}</p><p><b>Campus size:</b> ${INFO.size}</p><p><b>Website:</b> <a href="${INFO.website}" target="_blank" rel="noopener">gla.ac.in</a></p><p><b>Centre point:</b> ${INFO.centre}</p><p><b>Sources:</b> ${INFO.sources}</p><p class="warn">Office timings, library hours and bus/parking rules: to be verified.</p>`;
function status(){const v=P.filter(p=>p.verified).length,f=P.filter(p=>p.f).length;$('#dstat').innerHTML=`<p><span class="tag ok">${v}/${P.length}</span> positions surveyed · <span class="tag">${f}/${P.length}</span> facilities confirmed in public sources.</p><div style="background:#e2e8f0;border-radius:99px;height:10px"><div style="width:${v/P.length*100}%;background:#16a34a;height:10px;border-radius:99px"></div></div><small>Positions are placeholders until surveyed: Map → Edit mode → switch to Satellite and drag each marker onto its building, or stand there and tap “Set to my GPS position”.</small>`}
drawMarkers();lists();status();

function setGps(id){if(!navigator.geolocation){alert('GPS not available');return}
 navigator.geolocation.getCurrentPosition(g=>{const p=byId(id);if(g.coords.accuracy>30&&!confirm('GPS accuracy is only ±'+Math.round(g.coords.accuracy)+' m. Save anyway?'))return;
  p.lat=g.coords.latitude;p.lng=g.coords.longitude;p.verified=p.user=true;edits[id]=[p.lat,p.lng];SV('gla_edits',edits);drawMarkers();status();map.setView([p.lat,p.lng],19)},e=>alert('Location error: '+e.message),{enableHighAccuracy:true,timeout:15000})}

let addMode=false;
function newPlace(lat,lng){const name=prompt('Place name (e.g. CSE Department, IET Block B):');if(!name)return;
 const k=prompt('Category: '+Object.keys(CATS).join(', '),'academic');if(!CATS[k]){alert('Unknown category. Try again.');return}
 const desc=prompt('Short description (optional):','')||'Added by field survey.';
 const c=LS('gla_custom',[]);c.push({id:'c'+Date.now(),name,cat:k,desc,lat,lng,verified:true,user:true,f:true,custom:true,emergency:false});SV('gla_custom',c);location.reload()}
$('#addHere').onclick=()=>{addMode=true;alert('Now tap the map exactly where the place is.')};
$('#addGps').onclick=()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(g=>newPlace(g.coords.latitude,g.coords.longitude),e=>alert('Location error: '+e.message),{enableHighAccuracy:true,timeout:15000}):alert('GPS not available');
function delCustom(id){if(!confirm('Delete this place?'))return;SV('gla_custom',LS('gla_custom',[]).filter(c=>c.id!==id));delete edits[id];SV('gla_edits',edits);location.reload()}

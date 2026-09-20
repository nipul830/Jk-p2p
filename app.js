const USER_KEY='jkP2PUser';
const SESSION_KEY='jkP2PSession';
const SUPABASE_URL='https://gwvhuegpkziujcyqzcra.supabase.co';
const SUPABASE_KEY='sb_publishable_peDfskbZ_AXq2doOtkrC9Q_F1JSPCW8';

function makeId(prefix,len=8){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let out='';for(let i=0;i<len;i++)out+=chars[Math.floor(Math.random()*chars.length)];return prefix+out}
function getUser(){try{return JSON.parse(localStorage.getItem(USER_KEY)||'null')}catch(e){return null}}
function saveUser(u){localStorage.setItem(USER_KEY,JSON.stringify(u))}
function getSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch(e){return null}}
function saveSession(s){localStorage.setItem(SESSION_KEY,JSON.stringify(s))}
function clearSession(){localStorage.removeItem(SESSION_KEY);localStorage.removeItem(USER_KEY)}
function headers(token){return {'apikey':SUPABASE_KEY,'Authorization':'Bearer '+(token||SUPABASE_KEY),'Content-Type':'application/json'}}
async function sb(path,options={}){const res=await fetch(SUPABASE_URL+path,{...options,headers:{...headers(options.token),...(options.headers||{})}});const text=await res.text();let data=null;try{data=text?JSON.parse(text):null}catch(e){data=text}if(!res.ok)throw new Error(data?.msg||data?.message||data?.error_description||data?.error||'Supabase request failed');return data}
function defaultUser(email,nameOverride=''){const raw=(nameOverride||email.split('@')[0]||'User').trim();const name=raw.replace(/[._-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());return{name:name||'User',email,avatar:'',referenceId:makeId('JKP-',10),referralCode:makeId('JK',6),joinedAt:new Date().toISOString()}}
async function createProfile(session,email,nameOverride=''){
 const existing=await sb('/rest/v1/profiles?select=*&id=eq.'+encodeURIComponent(session.user.id),{token:session.access_token});
 if(existing.length){
  const p=existing[0];
  const u={id:p.id,name:p.name||nameOverride||'User',email:p.email||email,avatar:p.avatar_url||'',referenceId:p.reference_id,referralCode:p.referral_code,joinedAt:p.created_at};
  saveUser(u);return u;
 }
 throw new Error('Profile was not created automatically. Please try signup again.');
}
async function loginDemo(){
 const email=(document.getElementById('email')?.value||'').trim().toLowerCase(),password=(document.getElementById('password')?.value||'').trim();
 if(!/^\S+@\S+\.\S+$/.test(email)||password.length<4){alert('Valid email aur minimum 4 character password enter karein.');return}
 try{
  const session=await sb('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});
  saveSession(session);await createProfile(session,email);alert('Login successful');location.href='index.html';
 }catch(e){alert('Login failed: '+e.message)}
}
async function createAccount(){
 const name=(document.getElementById('signupName')?.value||'').trim();
 const email=(document.getElementById('signupEmail')?.value||'').trim().toLowerCase();
 const password=(document.getElementById('signupPassword')?.value||'').trim();
 const confirm=(document.getElementById('signupConfirm')?.value||'').trim();
 if(name.length<2){alert('Full name enter karein.');return}
 if(!/^\S+@\S+\.\S+$/.test(email)){alert('Valid email enter karein.');return}
 if(password.length<6){alert('Password minimum 6 characters ka hona chahiye.');return}
 if(password!==confirm){alert('Passwords match nahi karte.');return}
 try{
  const data=await sb('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:{full_name:name}})});
  if(data.access_token){
   saveSession(data);alert('Account created successfully');location.href='index.html';
  } else {
   alert('Account created successfully. Ab Login page se login karein.');
   location.href='login.html';
  }
 }catch(e){alert('Signup failed: '+e.message)}
}
async function createDemoAccount(){return createAccount()}
async function loadRemoteProfile(){
 const s=getSession();if(!s)return null;
 try{const rows=await sb('/rest/v1/profiles?select=*&id=eq.'+encodeURIComponent(s.user.id),{token:s.access_token});if(rows[0]){const p=rows[0];const u={id:p.id,name:p.name||'User',email:p.email,avatar:p.avatar_url||'',referenceId:p.reference_id,referralCode:p.referral_code,joinedAt:p.created_at};saveUser(u);return u}}catch(e){console.warn(e)}return getUser()
}
function initials(name){return(name||'U').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}
async function renderAuthNav(){const el=document.getElementById('authNav');if(!el)return;const u=await loadRemoteProfile();if(!u){el.className='btn dark';el.href='login.html';el.innerHTML='Login';return}el.className='profile-nav';el.href='profile.html';el.innerHTML=u.avatar?'<img class="avatar" src="'+u.avatar+'" alt="Profile"><span>Profile</span>':'<span class="avatar initials">'+initials(u.name)+'</span><span>Profile</span>'}
async function logout(){const s=getSession();try{if(s)await sb('/auth/v1/logout',{method:'POST',token:s.access_token})}catch(e){}clearSession();location.href='index.html'}
async function handleAvatar(input){
 const file=input.files&&input.files[0];if(!file)return;if(file.size>2*1024*1024){alert('Profile photo 2MB se chhoti rakhein.');return}
 const s=getSession(),u=getUser();if(!s||!u){alert('Login required');return}
 const reader=new FileReader();reader.onload=async()=>{try{const dataUrl=reader.result;await sb('/rest/v1/profiles?id=eq.'+encodeURIComponent(u.id),{method:'PATCH',token:s.access_token,headers:{Prefer:'return=minimal'},body:JSON.stringify({avatar_url:dataUrl})});u.avatar=dataUrl;saveUser(u);location.reload()}catch(e){alert('Profile photo update failed: '+e.message)}};reader.readAsDataURL(file)
}
async function shareReferral(){const u=await loadRemoteProfile();if(!u)return;const text='Join me on JK P2P. My referral code: '+u.referralCode;try{if(navigator.share)await navigator.share({title:'JK P2P Referral',text});else{await navigator.clipboard.writeText(text);alert('Referral message copied.')}}catch(e){}}
function startChat(s,r){location.href='chat.html?seller='+encodeURIComponent(s)+'&rate='+r}
function confirmDeal(){location.href='order.html'}
function submitPayment(){if(!document.getElementById('shot').files.length||!document.getElementById('utr').value){alert('Screenshot aur UTR dono submit karein.');return}alert('Demo payment proof submitted');location.href='order.html'}
function sendMsg(){let i=document.getElementById('msg'),c=document.getElementById('chat');if(i.value.trim()){let d=document.createElement('div');d.className='bubble me';d.textContent=i.value;c.appendChild(d);i.value=''}}
document.addEventListener('DOMContentLoaded',renderAuthNav);
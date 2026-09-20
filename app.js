const USER_KEY='jkP2PUser';

function makeId(prefix,len=8){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out='';
  for(let i=0;i<len;i++) out+=chars[Math.floor(Math.random()*chars.length)];
  return prefix+out;
}
function getUser(){try{return JSON.parse(localStorage.getItem(USER_KEY)||'null')}catch(e){return null}}
function saveUser(u){localStorage.setItem(USER_KEY,JSON.stringify(u))}
function defaultUser(email){
  const name=(email.split('@')[0]||'User').replace(/[._-]+/g,' ');
  return {name:name.replace(/\b\w/g,c=>c.toUpperCase()),email,avatar:'',referenceId:makeId('JKP-',10),referralCode:makeId('JK',6),joinedAt:new Date().toISOString()};
}
function loginDemo(){
  const email=(document.getElementById('email')?.value||'').trim().toLowerCase();
  const password=(document.getElementById('password')?.value||'').trim();
  if(!/^\S+@\S+\.\S+$/.test(email)||password.length<4){alert('Valid email aur minimum 4 character password enter karein.');return}
  const old=getUser();
  const user=old&&old.email===email?old:defaultUser(email);
  saveUser(user);
  alert('Login successful');
  location.href='index.html';
}
function createDemoAccount(){
  const email=(document.getElementById('email')?.value||'').trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(email)){alert('Pehle valid email enter karein.');return}
  saveUser(defaultUser(email)); alert('Demo account created'); location.href='index.html';
}
function initials(name){return (name||'U').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}
function renderAuthNav(){
  const el=document.getElementById('authNav'); if(!el)return;
  const u=getUser();
  if(!u){el.className='btn dark';el.href='login.html';el.innerHTML='Login';return}
  el.className='profile-nav';el.href='profile.html';
  el.innerHTML=u.avatar?'<img class="avatar" src="'+u.avatar+'" alt="Profile"><span>Profile</span>':'<span class="avatar initials">'+initials(u.name)+'</span><span>Profile</span>';
}
function logout(){localStorage.removeItem(USER_KEY);location.href='index.html'}
function handleAvatar(input){
  const file=input.files&&input.files[0]; if(!file)return;
  if(file.size>2*1024*1024){alert('Profile photo 2MB se chhoti rakhein.');return}
  const reader=new FileReader();reader.onload=()=>{const u=getUser();if(!u)return;u.avatar=reader.result;saveUser(u);location.reload()};reader.readAsDataURL(file);
}
async function shareReferral(){
  const u=getUser(); if(!u)return;
  const text='Join me on JK P2P. My referral code: '+u.referralCode;
  try{if(navigator.share){await navigator.share({title:'JK P2P Referral',text})}else{await navigator.clipboard.writeText(text);alert('Referral message copied.')}}catch(e){}
}
function startChat(s,r){location.href='chat.html?seller='+encodeURIComponent(s)+'&rate='+r}
function confirmDeal(){location.href='order.html'}
function submitPayment(){if(!document.getElementById('shot').files.length||!document.getElementById('utr').value){alert('Screenshot aur UTR dono submit karein.');return}alert('Demo payment proof submitted');location.href='order.html'}
function sendMsg(){let i=document.getElementById('msg'),c=document.getElementById('chat');if(i.value.trim()){let d=document.createElement('div');d.className='bubble me';d.textContent=i.value;c.appendChild(d);i.value=''}}
document.addEventListener('DOMContentLoaded',renderAuthNav);
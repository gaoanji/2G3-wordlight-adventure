const ALLOWED_CLASSES=["I1-5(许老师班)", "I1-5(洪老师班)", "I1-5(高老师班)", "I6-9(钟老师班)", "I6-9(屈老师班)", "I6-9(许老师班)"];
/* Browser-local player profiles. No cloud account or music service is connected. */
const LOCAL_PLAYERS_KEY='wordmaster_local_players_2g3_v2';
let profileEntryMode='edit',musicEnabled=true;
try{
 const musicSetup=localStorage.getItem('wordmaster_music_setup_v2');
 if(!musicSetup){musicEnabled=true;localStorage.setItem('wordmaster_music','on');localStorage.setItem('wordmaster_music_setup_v2','1')}
 else musicEnabled=localStorage.getItem('wordmaster_music')!=='off';
}catch{}
function readLocalPlayers(){try{return JSON.parse(localStorage.getItem(LOCAL_PLAYERS_KEY)||'{}')}catch{return {}}}
function playerIdentity(p){return JSON.stringify([p.name.trim(),p.className.trim()])}
function persistLocalPlayer(player){
 if(!player.localPlayerId)player.localPlayerId=crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
 localStorage.setItem(KEY,JSON.stringify(player));
 if(player.profile.name){const players=readLocalPlayers();players[player.localPlayerId]={state:JSON.parse(JSON.stringify(player)),mapPlace:savedMapPlace()};localStorage.setItem(LOCAL_PLAYERS_KEY,JSON.stringify(players))}
}
function showPlayerChoice(){
 profileModal.classList.add('hidden');
 if(!state.profile.name){openNewPlayer();return}
 document.getElementById('lastPlayerName').textContent=`${state.profile.name} · ${state.profile.className}`;
 document.getElementById('playerChoiceModal').classList.remove('hidden');document.getElementById('continuePlayer').focus();
}
function continueLastPlayer(){document.getElementById('playerChoiceModal').classList.add('hidden');save();homeBtn.focus({preventScroll:true});requestAnimationFrame(focusFullMap)}
function openNewPlayer(){
 profileEntryMode='new';document.getElementById('playerChoiceModal').classList.add('hidden');
 document.getElementById('profileTitle').textContent='新的冒险者';
 document.getElementById('profileNote').textContent='填写自己的资料。新用户从头开始；资料与已保存用户一致时，会继续该用户的进度。';
 nameInput.value='';classInput.value='';saveProfile.textContent='开始冒险';
 document.getElementById('cancelProfile').classList.toggle('hidden',!state.profile.name);
 profileModal.classList.remove('hidden');nameInput.focus();
}
function openPlayerEditor(){
 profileEntryMode='edit';document.getElementById('settingsModal').classList.add('hidden');
 document.getElementById('profileTitle').textContent='修改用户资料';document.getElementById('profileNote').textContent='修改资料不会清除你的学习进度。';
 nameInput.value=state.profile.name;classInput.value=state.profile.className;
 saveProfile.textContent='保存资料';document.getElementById('cancelProfile').classList.remove('hidden');profileModal.classList.remove('hidden');nameInput.focus();
}
function cancelProfileEntry(){profileModal.classList.add('hidden');if(profileEntryMode==='new')showPlayerChoice();else openGameSettings()}
function submitPlayerProfile(){
 const profile={name:nameInput.value.trim(),className:classInput.value.trim(),index:''};
 if(!profile.name){alert('请填写姓名。');return}
 if(!ALLOWED_CLASSES.includes(profile.className)){alert('请从列表中选择班级。');return}
 const players=readLocalPlayers(),identity=playerIdentity(profile),existing=Object.values(players).find(p=>playerIdentity(p.state.profile)===identity);
 if(profileEntryMode==='edit'){
  if(existing&&existing.state.localPlayerId!==state.localPlayerId){alert('这份资料已属于另一位用户，请检查姓名和班级。');return}
  window.WordlightCloud?.leave();state.profile=profile;save();profileModal.classList.add('hidden');openGameSettings();return;
 }
 // Preserve the outgoing player before loading or creating another player's state.
 if(state.profile.name)save();
 const currentMatches=state.profile.name&&playerIdentity(state.profile)===identity;
 if(!currentMatches){
  window.WordlightCloud?.leave();
  resetMapJourney();cardIndex=0;active=null;questions=[];pendingUnlock=null;
  state=existing?JSON.parse(JSON.stringify(existing.state)):fresh();state.profile=profile;normalize();
  if(existing?.mapPlace)localStorage.setItem('wordmaster_map_place_2g3_v2',existing.mapPlace);
 }
 save();profileModal.classList.add('hidden');renderHome();homeBtn.focus({preventScroll:true});requestAnimationFrame(focusFullMap);
}
function refreshAudioSettings(){
 for(const [id,on] of [['musicSetting',musicEnabled],['soundSetting',!uiMuted]]){const b=document.getElementById(id);b.setAttribute('aria-checked',String(on));b.textContent=on?'开':'关'}
}
function openGameSettings(){closeMapPanel();refreshAudioSettings();document.getElementById('settingsModal').classList.remove('hidden');document.getElementById('musicSetting').focus()}
function closeGameSettings(){document.getElementById('settingsModal').classList.add('hidden');profileBtn.focus()}
function toggleGameAudio(type){if(type==='music'){musicEnabled=!musicEnabled;localStorage.setItem('wordmaster_music',musicEnabled?'on':'off')}else{uiMuted=!uiMuted;localStorage.setItem('wordmaster_sound',uiMuted?'off':'on');if(uiMuted)window.GameEffects?.stop();else window.GameEffects?.play('button')}refreshAudioSettings();if(type==='music')syncGameMusic()}

/* Supplied music only: one player prevents overlap and fetches one track at a time. */
const gameBgm=new Audio();
gameBgm.preload='auto';gameBgm.autoplay=true;gameBgm.setAttribute('autoplay','');gameBgm.id='gameMusicPlayer';gameBgm.hidden=true;document.body.append(gameBgm);
let bgmRegion='',bgmTrack='',bgmUnlocked=false,bgmBag=[],bgmLastQuiz='',bgmDucked=false,bgmSpeechToken=0,bgmPlayVersion=0;
const bgmVolumes={main:.20,map:.16,quiz:.075};
function bgmScene(){
 if(document.getElementById('splash')||!document.getElementById('storyOverlay').classList.contains('hidden')||!document.getElementById('playerChoiceModal').classList.contains('hidden')||(profileEntryMode==='new'&&!profileModal.classList.contains('hidden')))return 'main';
 return document.body.dataset.room?'quiz':'map';
}
function nextQuizMusic(){
 if(!bgmBag.length){bgmBag=['quiz-1','quiz-2','quiz-3'];for(let i=2;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bgmBag[i],bgmBag[j]]=[bgmBag[j],bgmBag[i]]}if(bgmBag[0]===bgmLastQuiz)[bgmBag[0],bgmBag[1]]=[bgmBag[1],bgmBag[0]]}
 bgmLastQuiz=bgmBag.shift();return bgmLastQuiz;
}
function setBgmVolume(){
 const volume=(bgmVolumes[bgmRegion]||.075)*(bgmDucked?.16:1);
 gameBgm.volume=volume;
}
function startBgmTrack(track){
 bgmTrack=track;bgmPlayVersion++;gameBgm.pause();gameBgm.src=`assets/music/${track}.mp3`;gameBgm.loop=bgmRegion!=='quiz';
 gameBgm.load();
 setBgmVolume();tryPlayBgm();
}
function tryPlayBgm(){
 if(!musicEnabled||!bgmUnlocked||document.hidden||!bgmTrack)return;
 const version=bgmPlayVersion;gameBgm.play().then(()=>{if(version===bgmPlayVersion&&(!musicEnabled||document.hidden))gameBgm.pause()}).catch(()=>{});
}
function syncGameMusic(){
 const scene=bgmScene(),changed=scene!==bgmRegion;bgmRegion=scene;
 if(!musicEnabled||!bgmUnlocked||document.hidden){gameBgm.pause();return}
 if((scene==='quiz'&&gameBgm.ended)||changed||!bgmTrack||((scene==='quiz')!==bgmTrack.startsWith('quiz-'))||(scene!=='quiz'&&bgmTrack!==scene))startBgmTrack(scene==='quiz'?nextQuizMusic():scene);
 else{setBgmVolume();tryPlayBgm()}
}
function unlockGameMusic(){
 bgmUnlocked=true;
 syncGameMusic();
}
function duckGameMusic(){const token=++bgmSpeechToken;bgmDucked=true;setBgmVolume();return()=>{if(token!==bgmSpeechToken)return;bgmDucked=false;setBgmVolume()}}
gameBgm.addEventListener('ended',()=>{if(bgmRegion==='quiz'&&musicEnabled&&!document.hidden)startBgmTrack(nextQuizMusic())});
document.addEventListener('pointerdown',unlockGameMusic,{capture:true});
document.addEventListener('keydown',unlockGameMusic,{capture:true});
document.addEventListener('visibilitychange',syncGameMusic);
const musicSceneObserver=new MutationObserver(syncGameMusic);
musicSceneObserver.observe(document.body,{attributes:true,attributeFilter:['data-room'],childList:true});
for(const id of ['profileModal','playerChoiceModal'])musicSceneObserver.observe(document.getElementById(id),{attributes:true,attributeFilter:['class']});
syncGameMusic();
/* Try autoplay on the opening cover. Browsers that block autoplay will start
   it on the first tap/click, while the opening page still remains the main
   music scene until the player enters the map. */
unlockGameMusic();
window.addEventListener('load',()=>{unlockGameMusic();tryPlayBgm()},{once:true});

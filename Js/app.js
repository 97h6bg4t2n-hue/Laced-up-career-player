window.GameApp = (() => {
  const state={career:null,slot:null,creator:null,creatorStep:0,section:'home',pendingMatch:null,liveTimer:null};
  const $=s=>document.querySelector(s);

  function boot(){
    document.addEventListener('click',onClick);
    document.addEventListener('input',onCreatorInput);
    document.addEventListener('change',onCreatorInput);
    GameRouter.set('menu');
    GameUI.renderMenu();
  }
  function startCreator(slot){
    state.slot=Number(slot);state.creator=CareerSystem.defaultCreator();state.creatorStep=0;state.career=null;GameRouter.set('creator');GameUI.renderCreator(state.creator,state.creatorStep,state.slot);
  }
  function updateCreatorModel(){
    const el=document.getElementById('creator-model');
    if(el&&state.creator)PlayerModel.mount(el,{...state.creator,shirtNumber:state.creator.shirtNumberPreference},{kitColors:['#2585ba','#dff7ff']});
  }
  function onCreatorInput(e){
    const input=e.target.closest?.('[data-creator-field]');if(!input||GameRouter.get()!=='creator')return;
    const key=input.dataset.creatorField;let value=input.value;
    if(['startingAge','height','weight','shirtNumberPreference'].includes(key))value=Number(value);
    if(key.startsWith('appearance.'))state.creator.appearance[key.split('.')[1]]=value;else state.creator[key]=value;
    if(key==='surname'&&!state.creator.shirtName)state.creator.shirtName=String(value).toUpperCase();
    if(key==='dateOfBirth'){
      const age=GameUtils.ageOn(value,'2026-08-01');
      if(age>=15&&age<=18){state.creator.startingAge=age;const ageSelect=document.querySelector('[data-creator-field="startingAge"]');if(ageSelect)ageSelect.value=String(age);}
    }
    if(key==='startingAge'){
      const d=new Date(`${state.creator.dateOfBirth}T12:00:00`);if(!Number.isNaN(d.getTime())){const targetYear=2026-Number(value)-(d.getMonth()>7||(d.getMonth()===7&&d.getDate()>1)?1:0);const mm=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');state.creator.dateOfBirth=`${targetYear}-${mm}-${dd}`;const dob=document.querySelector('[data-creator-field="dateOfBirth"]');if(dob)dob.value=state.creator.dateOfBirth;}
    }
    updateCreatorModel();
  }
  function validateCreator(){
    const c=state.creator;
    if(!c.firstName.trim()||!c.surname.trim()){GameUI.toast('Enter a first name and surname.');return false}
    if(c.height<155||c.height>205){GameUI.toast('Height must be 155–205 cm.');return false}
    if(c.weight<50||c.weight>110){GameUI.toast('Weight must be 50–110 kg.');return false}
    if(c.shirtNumberPreference<1||c.shirtNumberPreference>99){GameUI.toast('Shirt number must be 1–99.');return false}
    if(c.primaryPosition===c.secondaryPosition){GameUI.toast('Choose a different secondary position.');return false}
    return true;
  }
  function beginCareer(){
    if(!validateCreator())return;
    state.career=CareerSystem.createCareer(state.creator,state.slot);
    if(!SaveSystem.save(state.slot,state.career)){GameUI.toast('Could not create the local save.');return}
    GameRouter.set('reveal');GameUI.renderReveal(state.career,false);
    const delay=state.career.settings.reducedMotion?250:1650;
    setTimeout(()=>{if(GameRouter.get()==='reveal')GameUI.renderReveal(state.career,true)},delay);
  }
  function loadCareer(slot){
    const career=SaveSystem.get(Number(slot));if(!career){GameUI.toast('That save slot is empty.');return}
    state.slot=Number(slot);state.career=career;state.section='home';GameRouter.set('game');GameUI.renderSection(state.career,'home');
  }
  function saveCurrent(showToast=true){
    if(!state.career||state.slot===null)return false;
    const ok=SaveSystem.save(state.slot,state.career);if(showToast)GameUI.toast(ok?'Career saved.':'Save failed.');return ok;
  }
  function renderCurrent(){if(state.career&&GameRouter.get()==='game')GameUI.renderSection(state.career,state.section)}
  function quickSim(){
    if(!CareerSystem.nextFixture(state.career)){GameUI.toast('No fixture available.');return}
    const result=MatchEngine.simulate(state.career);if(!result)return;
    state.pendingMatch=result;MatchEngine.apply(state.career,result);saveCurrent(false);GameUI.matchReport(state.career,result);
  }
  function liveSim(){
    if(!CareerSystem.nextFixture(state.career)){GameUI.toast('No fixture available.');return}
    const result=MatchEngine.simulate(state.career);if(!result)return;state.pendingMatch=result;
    const body=`<div class="live-commentary" id="live-commentary"><div class="comment-line"><span class="comment-minute">—</span>Teams are walking out. Commentary is ready.</div></div>`;
    GameUI.openModal({title:'Live Match',body,footer:'<span class="subtle" id="live-status">Match in progress…</span>',closable:false});
    const feed=document.getElementById('live-commentary'),events=result.events.slice();let i=0;
    const tick=()=>{
      if(i>=events.length){clearInterval(state.liveTimer);state.liveTimer=null;const foot=document.querySelector('.modal-foot');if(foot)foot.innerHTML='<span class="subtle">Full time.</span><button class="btn btn-primary" data-action="complete-live">Post-Match Report</button>';return}
      const ev=events[i++],line=document.createElement('div');line.className=`comment-line ${ev.type||''}`;line.innerHTML=`<span class="comment-minute">${ev.m}’</span>${GameUtils.escapeHTML(ev.t)}`;feed.appendChild(line);feed.scrollTop=feed.scrollHeight;
    };
    tick();
    if(state.career.settings.reducedMotion){while(i<events.length)tick();tick()}else state.liveTimer=setInterval(tick,380);
  }
  function completeLive(){
    if(!state.pendingMatch)return;const r=state.pendingMatch;MatchEngine.apply(state.career,r);saveCurrent(false);GameUI.matchReport(state.career,r);
  }
  function finishMatch(){state.pendingMatch=null;GameUI.closeModal();state.section='home';renderCurrent()}
  function showDelete(slot){
    const c=SaveSystem.get(slot);if(!c)return;
    GameUI.openModal({title:'Delete Career?',body:`<p>This permanently removes <strong>${GameUtils.escapeHTML(c.player.firstName)} ${GameUtils.escapeHTML(c.player.surname)}</strong> from Slot ${slot+1} on this device.</p><p class="muted">This action cannot be undone.</p>`,footer:`<button class="btn btn-ghost" data-action="close-modal">Cancel</button><button class="btn btn-danger" data-action="confirm-delete" data-slot="${slot}">Delete</button>`});
  }
  function onClick(e){
    const btn=e.target.closest?.('[data-action]');if(!btn)return;const action=btn.dataset.action;
    if(action==='new-career'){
      const empty=SaveSystem.list().find(x=>!x.career);if(empty)startCreator(empty.index);else GameUI.toast('All four slots are used. Delete a career to create another.');
    } else if(action==='new-career-slot')startCreator(btn.dataset.slot);
    else if(action==='load-career')loadCareer(btn.dataset.slot);
    else if(action==='delete-career')showDelete(Number(btn.dataset.slot));
    else if(action==='confirm-delete'){SaveSystem.remove(Number(btn.dataset.slot));GameUI.closeModal();GameUI.renderMenu();GameUI.toast('Career deleted.');}
    else if(action==='close-modal')GameUI.closeModal();
    else if(action==='cancel-creator'){GameRouter.set('menu');state.creator=null;GameUI.renderMenu();}
    else if(action==='creator-back'){if(state.creatorStep>0){state.creatorStep--;GameUI.renderCreator(state.creator,state.creatorStep,state.slot)}}
    else if(action==='creator-next'){if(validateCreator()&&state.creatorStep<4){state.creatorStep++;GameUI.renderCreator(state.creator,state.creatorStep,state.slot)}}
    else if(action==='begin-career')beginCareer();
    else if(action==='enter-career'){GameRouter.set('game');state.section='home';GameUI.renderSection(state.career,'home');}
    else if(action==='nav'){state.section=btn.dataset.section||'home';GameUI.renderSection(state.career,state.section);}
    else if(action==='manual-save')saveCurrent(true);
    else if(action==='quick-sim')quickSim();
    else if(action==='live-sim')liveSim();
    else if(action==='complete-live')completeLive();
    else if(action==='finish-match')finishMatch();
    else if(action==='return-menu'){saveCurrent(false);state.career=null;state.slot=null;GameRouter.set('menu');GameUI.renderMenu();}
    else if(action==='toggle-motion'){state.career.settings.reducedMotion=!state.career.settings.reducedMotion;saveCurrent(false);GameUI.renderSection(state.career,'more');GameUI.toast(`Reduced motion ${state.career.settings.reducedMotion?'enabled':'disabled'}.`);}
  }
  return {boot,state};
})();

document.addEventListener('DOMContentLoaded',()=>{
  GameApp.boot();
  if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./service-worker.js').catch(err=>console.warn('Service worker registration failed',err));
});

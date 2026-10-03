window.GameUtils = (() => {
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const rand=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;
  const randFloat=(min,max)=>Math.random()*(max-min)+min;
  const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
  const chance=p=>Math.random()<p;
  const uid=(prefix='id')=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;
  const weightedPick=(items,getWeight=x=>x.weight)=>{
    const total=items.reduce((s,x)=>s+Math.max(0,getWeight(x)),0);
    if(total<=0) return pick(items);
    let r=Math.random()*total;
    for(const item of items){r-=Math.max(0,getWeight(item));if(r<=0)return item;}
    return items[items.length-1];
  };
  const escapeHTML=(s='')=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const deepClone=obj=>JSON.parse(JSON.stringify(obj));
  const formatDate=(iso,opts={day:'numeric',month:'short',year:'numeric'})=>{
    try{return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined,opts);}catch{return iso;}
  };
  const addDays=(iso,days)=>{const d=new Date(`${iso}T12:00:00`);d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)};
  const ageOn=(dob,iso)=>{const d=new Date(dob), at=new Date(iso);let a=at.getFullYear()-d.getFullYear();const m=at.getMonth()-d.getMonth();if(m<0||(m===0&&at.getDate()<d.getDate()))a--;return a;};
  const formatMoney=n=>{
    if(n>=1e6)return `€${(n/1e6).toFixed(n>=10e6?0:1)}m`;
    if(n>=1e3)return `€${(n/1e3).toFixed(0)}k`;
    return `€${Math.round(n)}`;
  };
  const positionGroups={
    GK:'GK',RB:'DEF',RWB:'DEF',CB:'DEF',LB:'DEF',LWB:'DEF',CDM:'MID',CM:'MID',CAM:'MID',RM:'MID',LM:'MID',RW:'ATT',LW:'ATT',CF:'ATT',ST:'ATT'
  };
  const positions=Object.keys(positionGroups);
  const attributeGroups={
    Physical:['acceleration','sprintSpeed','agility','balance','strength','stamina','jumping'],
    Shooting:['finishing','shotPower','longShots','volleys','penalties'],
    Passing:['shortPassing','longPassing','crossing','vision','curve','freeKicks'],
    Control:['ballControl','dribbling','composure'],
    Defending:['tackling','defensiveAwareness','interceptions','heading','positioning','reactions'],
    Goalkeeping:['gkDiving','gkHandling','gkKicking','gkReflexes','gkPositioning']
  };
  const attributeLabels={
    acceleration:'Acceleration',sprintSpeed:'Sprint Speed',agility:'Agility',balance:'Balance',strength:'Strength',stamina:'Stamina',jumping:'Jumping',finishing:'Finishing',shotPower:'Shot Power',longShots:'Long Shots',volleys:'Volleys',penalties:'Penalties',shortPassing:'Short Passing',longPassing:'Long Passing',crossing:'Crossing',vision:'Vision',curve:'Curve',freeKicks:'Free Kicks',ballControl:'Ball Control',dribbling:'Dribbling',composure:'Composure',tackling:'Tackling',defensiveAwareness:'Def. Awareness',interceptions:'Interceptions',heading:'Heading',positioning:'Positioning',reactions:'Reactions',weakFoot:'Weak Foot',skillAbility:'Skill Ability',gkDiving:'GK Diving',gkHandling:'GK Handling',gkKicking:'GK Kicking',gkReflexes:'GK Reflexes',gkPositioning:'GK Positioning'
  };
  return {clamp,rand,randFloat,pick,chance,uid,weightedPick,escapeHTML,deepClone,formatDate,addDays,ageOn,formatMoney,positionGroups,positions,attributeGroups,attributeLabels};
})();

window.CareerSystem = (() => {
  const U=GameUtils;
  const baseAppearance={
    skinTone:'tan',faceShape:'oval',headShape:'normal',eyes:'standard',eyeColor:'brown',eyebrows:'normal',nose:'standard',mouth:'neutral',jaw:'standard',ears:'standard',
    hairStyle:'fade',hairLength:'short',hairColor:'black',facialHair:'none',facialHairColor:'black',freckles:'no',scar:'none',facialDetail:'none',armTattoo:'no',legTattoo:'no',
    shirtTucked:'untucked',sleeveLength:'short',sockHeight:'normal',bootStyle:'speed',bootColor:'black',wristTape:'no',gloves:'no',undershirt:'no'
  };
  function defaultCreator(){
    const age=16, year=2026-age;
    return {
      firstName:'Jayden',surname:'Petersen',nickname:'',shirtName:'PETERSEN',nationality:'ZA',birthplace:'Johannesburg',dateOfBirth:`${year}-06-15`,startingAge:age,shirtNumberPreference:11,
      primaryPosition:'RW',secondaryPosition:'LW',preferredFoot:'Right',height:174,weight:68,bodyBuild:'athletic',appearance:{...baseAppearance}
    };
  }
  const templateAttrs=()=>({
    acceleration:50,sprintSpeed:50,agility:50,balance:50,strength:50,stamina:50,jumping:50,
    finishing:45,shotPower:48,longShots:44,volleys:42,penalties:45,
    shortPassing:48,longPassing:44,crossing:46,vision:46,curve:44,freeKicks:40,
    ballControl:50,dribbling:50,composure:44,
    tackling:40,defensiveAwareness:40,interceptions:40,heading:44,positioning:46,reactions:48,
    weakFoot:3,skillAbility:3,gkDiving:20,gkHandling:20,gkKicking:20,gkReflexes:20,gkPositioning:20
  });
  const posBoosts={
    GK:{gkDiving:12,gkHandling:12,gkKicking:9,gkReflexes:13,gkPositioning:11,reactions:7,jumping:4},
    CB:{strength:8,jumping:8,tackling:12,defensiveAwareness:12,interceptions:11,heading:10,reactions:5,sprintSpeed:-3},
    RB:{acceleration:7,sprintSpeed:7,stamina:9,crossing:7,tackling:7,interceptions:6,defensiveAwareness:6},
    LB:{acceleration:7,sprintSpeed:7,stamina:9,crossing:7,tackling:7,interceptions:6,defensiveAwareness:6},
    RWB:{acceleration:8,sprintSpeed:8,stamina:10,crossing:8,dribbling:4,tackling:5},LWB:{acceleration:8,sprintSpeed:8,stamina:10,crossing:8,dribbling:4,tackling:5},
    CDM:{stamina:7,strength:5,shortPassing:8,longPassing:7,vision:5,tackling:9,defensiveAwareness:9,interceptions:10},
    CM:{stamina:8,shortPassing:10,longPassing:8,vision:8,ballControl:6,composure:5,positioning:4},
    CAM:{agility:6,shortPassing:9,vision:11,ballControl:9,dribbling:8,finishing:4,longShots:5,positioning:7},
    RM:{acceleration:7,sprintSpeed:7,crossing:9,dribbling:7,ballControl:6,stamina:6},LM:{acceleration:7,sprintSpeed:7,crossing:9,dribbling:7,ballControl:6,stamina:6},
    RW:{acceleration:10,sprintSpeed:9,agility:8,dribbling:11,ballControl:8,crossing:7,finishing:5,positioning:5},
    LW:{acceleration:10,sprintSpeed:9,agility:8,dribbling:11,ballControl:8,crossing:7,finishing:5,positioning:5},
    CF:{agility:6,finishing:9,shortPassing:6,vision:5,ballControl:8,dribbling:7,positioning:9,composure:6},
    ST:{acceleration:5,sprintSpeed:5,strength:5,finishing:13,shotPower:8,heading:8,positioning:12,reactions:7,composure:7}
  };
  function physicalModifiers(p){
    const m={};
    const h=Number(p.height),w=Number(p.weight);
    if(h>=188){m.strength=5;m.jumping=5;m.heading=4;m.agility=-4;m.balance=-2}
    else if(h<=170){m.agility=5;m.balance=5;m.acceleration=3;m.strength=-3;m.heading=-3}
    if(w>=82){m.strength=(m.strength||0)+5;m.acceleration=(m.acceleration||0)-2;m.agility=(m.agility||0)-2}
    else if(w<=62){m.acceleration=(m.acceleration||0)+3;m.agility=(m.agility||0)+2;m.strength=(m.strength||0)-3}
    if(p.bodyBuild==='lean'){m.agility=(m.agility||0)+3;m.acceleration=(m.acceleration||0)+2;m.strength=(m.strength||0)-2}
    if(p.bodyBuild==='stocky'){m.strength=(m.strength||0)+4;m.balance=(m.balance||0)+3;m.agility=(m.agility||0)-2}
    if(p.bodyBuild==='strong'){m.strength=(m.strength||0)+6;m.jumping=(m.jumping||0)+2;m.acceleration=(m.acceleration||0)-2}
    return m;
  }
  function generateAttributes(p){
    const attrs=templateAttrs();
    const targetBase=U.rand(46,54)+(Number(p.startingAge)-16)*2;
    Object.keys(attrs).forEach(k=>{
      if(k==='weakFoot'||k==='skillAbility')return;
      attrs[k]=k.startsWith('gk')?(p.primaryPosition==='GK'?targetBase+U.rand(-5,4):U.rand(10,25)):targetBase+U.rand(-6,6);
    });
    const boosts={...(posBoosts[p.primaryPosition]||{})};
    const phys=physicalModifiers(p);
    for(const [k,v] of Object.entries(boosts)) attrs[k]=(attrs[k]||40)+v;
    for(const [k,v] of Object.entries(phys)) attrs[k]=(attrs[k]||40)+v;
    if(p.primaryPosition==='GK'){
      ['finishing','dribbling','crossing','longShots','volleys'].forEach(k=>attrs[k]-=13);
      attrs.weakFoot=U.rand(2,4);attrs.skillAbility=U.rand(1,3);
    }else{
      attrs.weakFoot=U.rand(2,4); attrs.skillAbility=U.rand(2,4);
    }
    Object.keys(attrs).forEach(k=>{if(!['weakFoot','skillAbility'].includes(k))attrs[k]=U.clamp(Math.round(attrs[k]),25,72)});
    return attrs;
  }
  function calculateOverall(pos,a){
    const weights={
      GK:['gkDiving','gkHandling','gkReflexes','gkPositioning','gkKicking','reactions'],
      CB:['defensiveAwareness','tackling','interceptions','strength','heading','reactions'],
      RB:['sprintSpeed','acceleration','stamina','tackling','crossing','interceptions'],LB:['sprintSpeed','acceleration','stamina','tackling','crossing','interceptions'],
      RWB:['sprintSpeed','acceleration','stamina','crossing','dribbling','tackling'],LWB:['sprintSpeed','acceleration','stamina','crossing','dribbling','tackling'],
      CDM:['interceptions','defensiveAwareness','shortPassing','tackling','stamina','strength'],
      CM:['shortPassing','stamina','vision','ballControl','longPassing','reactions'],
      CAM:['vision','shortPassing','dribbling','ballControl','positioning','finishing'],
      RM:['sprintSpeed','acceleration','crossing','dribbling','ballControl','stamina'],LM:['sprintSpeed','acceleration','crossing','dribbling','ballControl','stamina'],
      RW:['acceleration','sprintSpeed','dribbling','ballControl','crossing','finishing'],LW:['acceleration','sprintSpeed','dribbling','ballControl','crossing','finishing'],
      CF:['finishing','ballControl','dribbling','positioning','vision','composure'],ST:['finishing','positioning','shotPower','reactions','sprintSpeed','heading']
    };
    const keys=weights[pos]||weights.CM;return Math.round(keys.reduce((s,k)=>s+(a[k]||50),0)/keys.length);
  }
  function generateHiddenPotential(ovr,p){
    const ageBonus=p.startingAge===16?4:p.startingAge===17?2:0;
    const ceiling=U.clamp(ovr+U.rand(15,34)+ageBonus,68,96);
    return {baseCeiling:ceiling,dynamicCeiling:ceiling,volatility:U.randFloat(.08,.28),developmentSeed:U.rand(100000,999999),revealed:false};
  }
  function clubWeight(club,p,ovr){
    const country=FCData.countries.find(c=>c.id===p.nationality); const clubCountry=FCData.countries.find(c=>c.id===club.country);
    let w=8 + club.recruitment*.16 + club.academy*.10;
    if(club.country===p.nationality)w*=7.2;
    else if(country&&clubCountry&&country.region===clubCountry.region)w*=2.0;
    else if(country?.region==='africa'&&['BE','PT','NL','FR'].includes(club.country))w*=1.85;
    else if(country?.region==='south-america'&&['PT','ES','IT'].includes(club.country))w*=1.65;
    if(ovr<club.minOvr) w*=Math.max(.06,1-(club.minOvr-ovr)*.13);
    if(ovr>club.maxOvr) w*=.75;
    if(club.tier===1){w*=ovr>=64?.5:ovr>=60?.18:.04;}
    if(club.tier===2)w*=1.15;
    if(p.startingAge===16&&club.academy>=90)w*=1.12;
    return Math.max(.1,w);
  }
  function chooseStartingClub(p,ovr){return U.weightedPick(FCData.clubs,c=>clubWeight(c,p,ovr));}
  function getSquadLevel(ovr,club,age){
    const rel=ovr-club.minOvr;
    if(club.tier===1){if(rel>=7&&age>=17)return 'Reserve / B Team';if(rel>=2)return age===16?'U18':'U19';return 'Youth Academy';}
    if(rel>=11)return 'Senior Squad';if(rel>=6)return 'Reserve Team';if(rel>=1)return age===16?'U18':'U19';return 'Youth Academy';
  }
  function generateFixtures(club,squadLevel){
    const pool=FCData.opponents[club.country]||['Academy United','City Youth','Sporting Academy','Athletic Reserves'];
    const fixtures=[];let date='2026-08-08';
    for(let i=0;i<14;i++){
      const opponent=pool[i%pool.length];
      fixtures.push({id:U.uid('match'),date,opponent,home:i%2===0,competition:squadLevel.includes('Senior')?club.league:`${club.league} Youth`,played:false,result:null,playerStats:null});
      date=U.addDays(date,U.rand(6,9));
    }
    return fixtures;
  }
  function zeroStats(){return {appearances:0,starts:0,minutes:0,goals:0,assists:0,shots:0,shotsOnTarget:0,passes:0,passesCompleted:0,keyPasses:0,chancesCreated:0,dribbles:0,tackles:0,interceptions:0,clearances:0,headers:0,fouls:0,yellowCards:0,redCards:0,distanceKm:0,possessionLost:0,saves:0,cleanSheets:0,ratingTotal:0,averageRating:0,potm:0};}
  function createCareer(raw,slot){
    const p=U.deepClone(raw);p.startingAge=Number(p.startingAge);p.height=Number(p.height);p.weight=Number(p.weight);p.shirtNumberPreference=Number(p.shirtNumberPreference);
    const attrs=generateAttributes(p); const ovr=calculateOverall(p.primaryPosition,attrs); const club=chooseStartingClub(p,ovr); const squadLevel=getSquadLevel(ovr,club,p.startingAge);
    const playerId=U.uid('player'), careerId=U.uid('career'); const currentDate='2026-08-01';
    const player={
      id:playerId,firstName:p.firstName.trim()||'Player',surname:p.surname.trim()||'One',nickname:p.nickname.trim(),shirtName:(p.shirtName.trim()||p.surname.trim()||'PLAYER').toUpperCase(),nationality:p.nationality,birthplace:p.birthplace.trim(),dateOfBirth:p.dateOfBirth,startingAge:p.startingAge,
      shirtNumberPreference:p.shirtNumberPreference,shirtNumber:p.shirtNumberPreference,primaryPosition:p.primaryPosition,secondaryPosition:p.secondaryPosition,preferredFoot:p.preferredFoot,height:p.height,weight:p.weight,bodyBuild:p.bodyBuild,appearance:p.appearance,
      attributes:attrs,overall:ovr,highestOverall:ovr,hiddenPotential:generateHiddenPotential(ovr,p),form:6.5,morale:72,fitness:92,sharpness:67,confidence:64,reputation:U.clamp(12+(ovr-50)*1.4,10,35),marketValue:Math.round((ovr-40)*(ovr-40)*8500),traits:[],injury:null
    };
    const fixtures=generateFixtures(club,squadLevel);
    return {
      meta:{id:careerId,schemaVersion:SaveSystem.SCHEMA_VERSION,slot,createdAt:new Date().toISOString(),lastSavedAt:new Date().toISOString()},
      player,clubId:club.id,squadLevel,currentDate,seasonLabel:'2026/27',managerTrust:U.rand(38,55),managerRole:squadLevel==='Senior Squad'?'Fringe Player':'Academy Prospect',
      contract:{type:squadLevel==='Youth Academy'?'Academy terms':'Youth contract',wage:squadLevel==='Senior Squad'?U.rand(500,2200):U.rand(80,450),endDate:'2028-06-30'},
      fixtures,nextFixtureIndex:0,seasonStats:zeroStats(),competitionStats:{},history:[{seasonLabel:'2026/27',clubId:club.id,age:p.startingAge,stats:zeroStats(),competitionStats:{},trophies:[],awards:[]}],timeline:[{date:'2026-08-01',title:`Joined ${club.name}`,detail:`Career began with ${squadLevel}.`}],
      news:[{date:'2026-08-01',title:`${player.firstName} ${player.surname} joins ${club.name}`,body:`The ${p.startingAge}-year-old ${p.primaryPosition} has entered the ${squadLevel.toLowerCase()} setup.`}],
      messages:[{date:'2026-08-01',from:'Academy Staff',text:'Welcome to the club. Your first objective is simple: train well and earn trust.'}],
      settings:{sound:true,reducedMotion:false},retired:false
    };
  }
  function getClub(career){return FCData.clubs.find(c=>c.id===career.clubId)}
  function nextFixture(career){return career.fixtures.find(f=>!f.played)||null}
  function addTimeline(career,title,detail){career.timeline.unshift({date:career.currentDate,title,detail});if(career.timeline.length>80)career.timeline.length=80}
  function addNews(career,title,body){career.news.unshift({date:career.currentDate,title,body});if(career.news.length>30)career.news.length=30}
  function deriveRole(career){
    const t=career.managerTrust;career.managerRole=t>=88?'Star Player':t>=77?'Important Player':t>=65?'Starter':t>=54?'Rotation':t>=42?'Fringe Player':'Academy Prospect';return career.managerRole;
  }
  return {defaultCreator,createCareer,getClub,nextFixture,zeroStats,calculateOverall,addTimeline,addNews,deriveRole};
})();

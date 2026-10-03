window.MatchEngine = (() => {
  const U=GameUtils;
  function statQuality(player){const a=player.attributes,p=player.primaryPosition,g=U.positionGroups[p];
    if(g==='ATT')return (a.finishing+a.dribbling+a.positioning+a.reactions+a.composure)/5;
    if(g==='MID')return (a.shortPassing+a.vision+a.ballControl+a.stamina+a.reactions)/5;
    if(g==='DEF')return (a.tackling+a.interceptions+a.defensiveAwareness+a.strength+a.reactions)/5;
    return (a.gkDiving+a.gkHandling+a.gkReflexes+a.gkPositioning+a.reactions)/5;
  }
  function poisson(lambda){let L=Math.exp(-lambda),k=0,p=1;do{k++;p*=Math.random()}while(p>L&&k<8);return k-1}
  function simulate(career){
    const fixture=CareerSystem.nextFixture(career);if(!fixture)return null;
    const player=career.player, a=player.attributes, group=U.positionGroups[player.primaryPosition], club=CareerSystem.getClub(career);
    const starterChance=U.clamp(.35+career.managerTrust/150+player.form/35, .38,.92);
    const started=U.chance(starterChance); const minutes=started?U.rand(68,90):U.chance(.72)?U.rand(12,35):0;
    const quality=statQuality(player); const fatigueFactor=U.clamp(player.fitness/100,.58,1); const formFactor=U.clamp(player.form/7,.78,1.22);
    const teamStrength=1.15+(club.tier===1?.35:club.tier===2?.18:0)+(player.overall-55)/130;
    let teamGoals=poisson(teamStrength),oppGoals=poisson(1.15+(club.tier===3?.15:0));
    const per90=minutes/90; const stats={started,minutes,goals:0,assists:0,shots:0,shotsOnTarget:0,passes:0,passesCompleted:0,keyPasses:0,chancesCreated:0,dribbles:0,tackles:0,interceptions:0,clearances:0,headers:0,fouls:0,yellowCards:0,redCards:0,distanceKm:0,possessionLost:0,saves:0,cleanSheet:false,rating:0};
    if(minutes>0){
      stats.distanceKm=+(U.randFloat(7.8,11.4)*per90).toFixed(1);
      stats.fouls=Math.max(0,Math.round(U.randFloat(0,1.7)*per90));stats.yellowCards=U.chance(.07*per90+.015*stats.fouls)?1:0;stats.redCards=stats.yellowCards&&U.chance(.015)?1:0;
      if(group==='ATT'){
        stats.shots=Math.round(U.randFloat(1.3,4.4)*per90*(quality/60));stats.shotsOnTarget=Math.min(stats.shots,Math.round(stats.shots*U.randFloat(.38,.68)));
        stats.goals=Math.min(teamGoals,poisson(Math.max(.02,stats.shotsOnTarget*(a.finishing/100)*.23*formFactor*fatigueFactor)));
        stats.passes=Math.round(U.randFloat(20,39)*per90);stats.keyPasses=Math.round(U.randFloat(.3,2.2)*per90*(a.vision/60));stats.dribbles=Math.round(U.randFloat(1.5,5.5)*per90*(a.dribbling/60));stats.assists=Math.min(Math.max(0,teamGoals-stats.goals),poisson(stats.keyPasses*(a.shortPassing/100)*.17));stats.possessionLost=Math.round(U.randFloat(5,12)*per90);
      } else if(group==='MID'){
        stats.shots=Math.round(U.randFloat(.4,2.4)*per90);stats.shotsOnTarget=Math.min(stats.shots,Math.round(stats.shots*.45));stats.goals=Math.min(teamGoals,poisson(stats.shotsOnTarget*(a.finishing/100)*.16));
        stats.passes=Math.round(U.randFloat(32,68)*per90);stats.keyPasses=Math.round(U.randFloat(.8,3.7)*per90*(a.vision/60));stats.dribbles=Math.round(U.randFloat(.5,3.1)*per90);stats.tackles=Math.round(U.randFloat(.5,2.7)*per90);stats.interceptions=Math.round(U.randFloat(.3,2.4)*per90);stats.assists=Math.min(Math.max(0,teamGoals-stats.goals),poisson(stats.keyPasses*(a.shortPassing/100)*.2));stats.possessionLost=Math.round(U.randFloat(4,10)*per90);
      } else if(group==='DEF'){
        stats.shots=Math.round(U.randFloat(.1,1.2)*per90);stats.shotsOnTarget=Math.min(stats.shots,Math.round(stats.shots*.35));stats.goals=Math.min(teamGoals,poisson(stats.shotsOnTarget*(a.heading/100)*.13));stats.passes=Math.round(U.randFloat(30,62)*per90);stats.tackles=Math.round(U.randFloat(1.2,4.5)*per90*(a.tackling/60));stats.interceptions=Math.round(U.randFloat(1,4)*per90*(a.interceptions/60));stats.clearances=Math.round(U.randFloat(1.5,6)*per90);stats.headers=Math.round(U.randFloat(1,5)*per90);stats.keyPasses=Math.round(U.randFloat(0,.8)*per90);stats.assists=U.chance(.04*per90)?1:0;stats.possessionLost=Math.round(U.randFloat(2,7)*per90);
      } else {
        stats.passes=Math.round(U.randFloat(18,35)*per90);stats.saves=Math.max(0,Math.round((oppGoals+U.randFloat(1,5))*per90*(a.gkReflexes/65)));stats.cleanSheet=oppGoals===0&&minutes>=60;stats.possessionLost=Math.round(U.randFloat(1,4)*per90);
      }
      const passAbility=(a.shortPassing+a.composure)/2;const completion=U.clamp(.69+(passAbility-45)/150+U.randFloat(-.04,.04),.62,.94);stats.passesCompleted=Math.round(stats.passes*completion);stats.chancesCreated=stats.keyPasses;
    }
    if(stats.goals>teamGoals)teamGoals=stats.goals;if(stats.assists>Math.max(0,teamGoals-stats.goals))stats.assists=Math.max(0,teamGoals-stats.goals);
    if(group==='GK'&&minutes>=60)stats.cleanSheet=oppGoals===0;
    stats.rating=calculateRating(stats,group,teamGoals,oppGoals);
    const result={fixtureId:fixture.id,homeGoals:fixture.home?teamGoals:oppGoals,awayGoals:fixture.home?oppGoals:teamGoals,teamGoals,oppGoals,stats,events:buildEvents(fixture,career,stats,teamGoals,oppGoals)};
    return result;
  }
  function calculateRating(s,group,teamGoals,oppGoals){
    if(s.minutes===0)return 0;
    let r=6.05;
    r+=s.goals*1.15+s.assists*.75+s.keyPasses*.08+s.dribbles*.035+s.tackles*.045+s.interceptions*.055+s.clearances*.025+s.saves*.08;
    if(group==='GK'&&s.cleanSheet)r+=.55;if(group==='DEF'&&oppGoals===0&&s.minutes>=60)r+=.35;
    r+=(s.passes?((s.passesCompleted/s.passes)-.75)*1.6:0)-s.possessionLost*.015-s.yellowCards*.18-s.redCards*.9;
    if(teamGoals>oppGoals)r+=.15;else if(teamGoals<oppGoals)r-=.12;
    return +U.clamp(r,4.2,10).toFixed(1);
  }
  function buildEvents(fixture,career,s,tg,og){
    const name=career.player.surname,events=[{m:1,t:`Kick-off. ${fixture.home?'Your side':'The hosts'} move the ball early.`,type:''}];
    const used=new Set([1,45,90]);
    const add=(m,t,type='')=>{while(used.has(m)&&m<89)m++;used.add(m);events.push({m,t,type})};
    if(s.minutes===0)add(U.rand(50,70),`${name} remains among the substitutes as the match develops.`,'user');
    else{
      if(!s.started)add(U.rand(55,72),`${name} is called from the bench and enters the match.`,'user');
      if(s.tackles||s.interceptions)add(U.rand(10,38),`Excellent defensive read by ${name}; the move is stopped cleanly.`,'user');
      if(s.dribbles>=2)add(U.rand(14,55),`${name} beats a defender and drives into space.`,'user');
      if(s.keyPasses>=1)add(U.rand(20,65),`${name} slides a dangerous pass through the line.`,'user');
      for(let i=0;i<s.goals;i++)add(U.rand(15,84),`GOAL! ${name} finishes the chance.`, 'goal');
      for(let i=0;i<s.assists;i++)add(U.rand(18,86),`Assist for ${name}! A teammate converts the chance.`, 'goal');
      if(s.yellowCards)add(U.rand(24,80),`${name} is shown a yellow card.`,'');
      if(s.saves>=3)add(U.rand(12,75),`Strong save by ${name} to keep the score under control.`,'user');
    }
    let scored=0,conceded=0;
    while(scored<Math.max(0,tg-s.goals)){add(U.rand(8,88),`Goal for your team after a well-worked attack.`,'goal');scored++}
    while(conceded<og){add(U.rand(8,88),`The opposition score.`, '');conceded++}
    events.push({m:45,t:'Half time.',type:''},{m:90,t:`Full time. ${tg}–${og}.`,type:''});
    return events.sort((a,b)=>a.m-b.m);
  }
  function apply(career,result){
    const fixture=career.fixtures.find(f=>f.id===result.fixtureId);if(!fixture||fixture.played)return career;
    fixture.played=true;fixture.result={homeGoals:result.homeGoals,awayGoals:result.awayGoals};fixture.playerStats=result.stats;
    const s=result.stats,t=career.seasonStats;
    const addToStats=(t)=>{if(s.minutes>0){t.appearances++;if(s.started)t.starts++;t.minutes+=s.minutes;t.goals+=s.goals;t.assists+=s.assists;t.shots+=s.shots;t.shotsOnTarget+=s.shotsOnTarget;t.passes+=s.passes;t.passesCompleted+=s.passesCompleted;t.keyPasses+=s.keyPasses;t.chancesCreated+=s.chancesCreated;t.dribbles+=s.dribbles;t.tackles+=s.tackles;t.interceptions+=s.interceptions;t.clearances+=s.clearances;t.headers+=s.headers;t.fouls+=s.fouls;t.yellowCards+=s.yellowCards;t.redCards+=s.redCards;t.distanceKm=+(t.distanceKm+s.distanceKm).toFixed(1);t.possessionLost+=s.possessionLost;t.saves+=s.saves;if(s.cleanSheet)t.cleanSheets++;t.ratingTotal+=s.rating;t.averageRating=+(t.ratingTotal/t.appearances).toFixed(2);if(s.rating>=8.5)t.potm++;}};
    addToStats(t);
    if(!career.competitionStats[fixture.competition])career.competitionStats[fixture.competition]=CareerSystem.zeroStats();
    addToStats(career.competitionStats[fixture.competition]);
    const record=career.history?.find(h=>h.seasonLabel===career.seasonLabel);
    if(record){record.stats=GameUtils.deepClone(career.seasonStats);record.competitionStats=GameUtils.deepClone(career.competitionStats);}
    career.player.form=s.minutes?+U.clamp((career.player.form*.7+s.rating*.3),4.5,9.5).toFixed(1):+U.clamp(career.player.form-.1,4.5,9.5).toFixed(1);
    career.player.fitness=U.clamp(Math.round(career.player.fitness-(s.minutes/90)*U.rand(14,22)+U.rand(5,10)),45,100);
    career.player.morale=U.clamp(career.player.morale+(result.teamGoals>result.oppGoals?3:result.teamGoals<result.oppGoals?-2:0)+(s.rating>=7.5?3:s.rating&&s.rating<6?-2:0),20,100);
    career.managerTrust=U.clamp(career.managerTrust+(s.rating>=8?5:s.rating>=7?3:s.rating>=6.4?1:s.rating===0?-1:-2),10,100);CareerSystem.deriveRole(career);
    const matchDay=fixture.date;career.currentDate=GameUtils.addDays(matchDay,1);career.player.fitness=U.clamp(career.player.fitness+5,45,100);
    const score=`${result.teamGoals}-${result.oppGoals}`;CareerSystem.addNews(career,`${CareerSystem.getClub(career).name} ${score} ${fixture.opponent}`,s.minutes?`${career.player.surname} played ${s.minutes} minutes and earned a ${s.rating.toFixed(1)} rating.`:`${career.player.surname} was an unused substitute.`);
    const next=CareerSystem.nextFixture(career);if(next)career.currentDate=GameUtils.addDays(career.currentDate,2);
    return career;
  }
  return {simulate,apply};
})();

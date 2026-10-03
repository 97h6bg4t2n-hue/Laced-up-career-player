window.PlayerModel = (() => {
  const skinMap={light:'#f3c7a8',fair:'#e8b38e',tan:'#c9855d',brown:'#945d3f',deep:'#603c2f',dark:'#3b2925'};
  const hairMap={black:'#171719',darkBrown:'#38251f',brown:'#6c4834',blonde:'#c9a45c',ginger:'#a9502d',platinum:'#dfd9c6'};
  const eyeMap={brown:'#6a422a',dark:'#211d1b',hazel:'#847141',green:'#4a7a58',blue:'#4f86aa',grey:'#84919b'};
  const bootMap={black:'#14171c',white:'#e9edf0',red:'#cf3d4b',blue:'#2e68be',green:'#20a66b',gold:'#d1a63b'};
  const hairPaths={
    buzz:`<path class="pm-hair" d="M104 60 Q150 25 196 60 L191 83 Q150 63 109 83Z"/>`,
    fade:`<path class="pm-hair" d="M101 67 Q150 21 199 67 L193 83 Q153 58 107 84Z"/><path class="pm-hair" opacity=".45" d="M103 71L109 103L116 83Q151 61 190 83L197 71Q195 45 150 40Q105 45 103 71Z"/>`,
    curls:`<g class="pm-hair"><circle cx="111" cy="62" r="18"/><circle cx="132" cy="49" r="20"/><circle cx="156" cy="46" r="21"/><circle cx="181" cy="52" r="20"/><circle cx="194" cy="69" r="17"/></g>`,
    afro:`<path class="pm-hair" d="M92 73Q90 28 126 23Q152 2 179 22Q211 28 207 74Q195 61 188 78Q151 59 112 79Q105 61 92 73Z"/>`,
    braids:`<path class="pm-hair" d="M102 62Q150 24 198 62L191 79Q150 57 108 80Z"/><g class="pm-hair" stroke="currentColor" stroke-width="8" stroke-linecap="round"><path d="M113 73v67"/><path d="M132 63v84"/><path d="M151 60v88"/><path d="M171 64v82"/><path d="M189 73v66"/></g>`,
    locs:`<path class="pm-hair" d="M101 63Q150 20 199 63L191 84Q150 58 108 85Z"/><g class="pm-hair" stroke="currentColor" stroke-width="9" stroke-linecap="round"><path d="M108 76l-5 72"/><path d="M126 66l-2 88"/><path d="M146 62v98"/><path d="M166 65l3 91"/><path d="M187 74l7 75"/></g>`,
    long:`<path class="pm-hair" d="M98 63Q150 18 202 63L197 142Q184 159 173 138L188 81Q151 57 111 82L127 139Q111 157 101 140Z"/>`
  };
  function faceRx(shape){return {narrow:42,oval:48,round:52,square:49,diamond:46}[shape]||48}
  function faceRy(shape){return {narrow:61,oval:58,round:52,square:56,diamond:59}[shape]||58}
  function bodyScale(build){return {lean:.88,athletic:1,stocky:1.1,strong:1.16}[build]||1}
  function svg(player,{kitColors}={}){
    const a=player.appearance||{};
    const skin=skinMap[a.skinTone]||skinMap.tan;
    const hair=hairMap[a.hairColor]||hairMap.black;
    const facial=hairMap[a.facialHairColor]||hair;
    const eye=eyeMap[a.eyeColor]||eyeMap.brown;
    const boots=bootMap[a.bootColor]||bootMap.black;
    const colors=kitColors||player.clubColors||['#2b7fc2','#ffffff'];
    const primary=colors[0], secondary=colors[1]||'#fff';
    const weightFactor=GameUtils.clamp(1+((Number(player.weight)||70)-70)/300,.94,1.12);
    const build=bodyScale(player.bodyBuild||'athletic')*weightFactor;
    const rx=faceRx(a.faceShape), baseRy=faceRy(a.faceShape);
    const ry=baseRy+({short:-5,normal:0,long:6}[a.headShape]||0);
    const eyeRx=({narrow:6,standard:8,wide:10}[a.eyes]||8), eyeRy=({narrow:3.5,standard:5,wide:5.5}[a.eyes]||5);
    const earRx=({small:5,standard:7,large:9}[a.ears]||7), earRy=({small:11,standard:14,large:17}[a.ears]||14);
    const hairKey=a.hairstyle||'fade';
    const hairSvg=(hairPaths[hairKey]||hairPaths.fade).replaceAll('currentColor',hair);
    const hairExtra=(a.hairLength==='medium'&&!['long','braids','locs'].includes(hairKey))?`<path d="M105 72q-6 40 4 67M195 72q6 40-4 67" stroke="${hair}" stroke-width="10" stroke-linecap="round"/>`:(a.hairLength==='long'&&!['long','braids','locs'].includes(hairKey))?`<path d="M105 72q-10 55 3 91M195 72q10 55-3 91" stroke="${hair}" stroke-width="12" stroke-linecap="round"/>`:'';
    const beard=a.facialHair&&a.facialHair!=='none'?`<path d="M117 111Q150 144 183 111Q177 158 150 164Q123 158 117 111Z" fill="${facial}" opacity="${a.facialHair==='stubble'?'.32':'.8'}"/>`:'';
    const freckles=a.freckles==='yes'?`<g fill="#8a513c" opacity=".55"><circle cx="128" cy="103" r="1.4"/><circle cx="135" cy="106" r="1.2"/><circle cx="171" cy="103" r="1.4"/><circle cx="164" cy="107" r="1.1"/></g>`:'';
    const facialDetail=a.facialDetail==='cheek marks'?`<g stroke="#8d5846" stroke-width="2" opacity=".5"><path d="M120 118l12 3"/><path d="M168 121l12-3"/></g>`:a.facialDetail==='under-eye'?`<g stroke="#7a5147" stroke-width="2" opacity=".45"><path d="M121 107q9 5 18 0"/><path d="M161 107q9 5 18 0"/></g>`:'';
    const scar=a.scar&&a.scar!=='none'?`<path d="M${a.scar==='left'?125:174} 86l-8 25" stroke="#7b4e42" stroke-width="2" opacity=".7"/>`:'';
    const armTattoo=a.armTattoo==='yes'?`<g class="pm-tattoo" stroke="#22313a" stroke-width="3" fill="none"><path d="M75 221q-18 17-22 53q13-14 25-3"/><path d="M225 221q18 17 22 53q-13-14-25-3"/></g>`:'';
    const legTattoo=a.legTattoo==='yes'?`<g class="pm-tattoo" stroke="#23323a" stroke-width="3" fill="none"><path d="M116 374l-8 35 12 18"/><path d="M184 374l8 35-12 18"/></g>`:'';
    const sleeves=a.sleeveLength==='long'?`<path d="M84 198L52 287Q48 302 64 307Q76 310 82 292L109 218Z" fill="${primary}"/><path d="M216 198L248 287Q252 302 236 307Q224 310 218 292L191 218Z" fill="${primary}"/>`:'';
    const gloves=a.gloves==='yes'?`<g fill="#181c22"><ellipse cx="58" cy="303" rx="11" ry="15"/><ellipse cx="242" cy="303" rx="11" ry="15"/></g>`:'';
    const tape=a.wristTape==='yes'?`<g fill="#e7e9ec"><rect x="50" y="282" width="18" height="9" rx="3"/><rect x="232" y="282" width="18" height="9" rx="3"/></g>`:'';
    const shirtY=a.shirtTucked==='tucked'?294:307;
    const bootDetail=a.bootStyle==='classic'?`<path d="M104 439h34M166 439h34" stroke="#ffffff" stroke-width="2" opacity=".7"/>`:a.bootStyle==='control'?`<path d="M108 436l22 8M170 436l22 8" stroke="#ffffff" stroke-width="3" opacity=".7"/>`:'';
    const sockTop={low:407,normal:393,high:378}[a.sockHeight]||393;
    const number=player.shirtNumberPreference||player.shirtNumber||11;
    const shirtName=(player.shirtName||player.surname||'PLAYER').slice(0,12).toUpperCase();
    return `<svg class="player-model-svg" viewBox="0 0 300 470" role="img" aria-label="Player model preview">
      <defs><linearGradient id="kitGrad" x1="0" x2="1"><stop stop-color="${primary}"/><stop offset="1" stop-color="${primary}" stop-opacity=".82"/></linearGradient></defs>
      <ellipse cx="150" cy="451" rx="82" ry="12" fill="#000" opacity=".22"/>
      <g transform="translate(150 0) scale(${build} 1) translate(-150 0)">
        <path d="M103 191Q150 166 197 191L216 ${shirtY}Q184 323 150 323Q116 323 84 ${shirtY}Z" fill="url(#kitGrad)" class="pm-shirt"/>
        <path d="M101 194L75 208L48 286Q45 296 56 301Q67 306 73 293L104 220Z" fill="${skin}" class="pm-skin"/>
        <path d="M199 194L225 208L252 286Q255 296 244 301Q233 306 227 293L196 220Z" fill="${skin}" class="pm-skin"/>
        ${sleeves}${tape}${gloves}${armTattoo}
        <path d="M112 304L143 304L137 399L104 399Z" fill="#14212c"/><path d="M157 304L188 304L196 399L163 399Z" fill="#14212c"/>
        <path d="M104 398L137 398L134 438L105 438Z" fill="${secondary}"/><path d="M163 398L196 398L195 438L166 438Z" fill="${secondary}"/>
        <path d="M104 ${sockTop}L137 ${sockTop}L134 438L105 438Z" fill="${secondary}"/><path d="M163 ${sockTop}L196 ${sockTop}L195 438L166 438Z" fill="${secondary}"/>
        ${legTattoo}
        <path class="pm-boot" d="M100 432h37l8 14q-20 10-52 0Z" fill="${boots}"/><path class="pm-boot" d="M163 432h37l7 14q-31 10-52 0Z" fill="${boots}"/>${bootDetail}
        <path d="M140 162h20v32h-20z" fill="${skin}" class="pm-skin"/>
        <ellipse cx="150" cy="105" rx="${rx}" ry="${ry}" fill="${skin}" class="pm-skin"/>
        <ellipse cx="101" cy="107" rx="${earRx}" ry="${earRy}" fill="${skin}"/><ellipse cx="199" cy="107" rx="${earRx}" ry="${earRy}" fill="${skin}"/>
        <g class="pm-eye"><ellipse cx="130" cy="99" rx="${eyeRx}" ry="${eyeRy}" fill="#f6f4ef"/><circle cx="131" cy="99" r="3.4" fill="${eye}"/><ellipse cx="170" cy="99" rx="${eyeRx}" ry="${eyeRy}" fill="#f6f4ef"/><circle cx="169" cy="99" r="3.4" fill="${eye}"/></g>
        <path d="M121 88q10-7 20 0" stroke="${hair}" stroke-width="${a.eyebrows==='thick'?5:3}" stroke-linecap="round" fill="none"/><path d="M159 88q10-7 20 0" stroke="${hair}" stroke-width="${a.eyebrows==='thick'?5:3}" stroke-linecap="round" fill="none"/>
        <path d="M150 100l${a.nose==='wide'?8:5} 23h-${a.nose==='wide'?11:7}" stroke="#a9684f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M133 137q17 ${a.mouth==='smile'?10:3} 34 0" stroke="#8c4f4d" stroke-width="3" fill="none" stroke-linecap="round"/>
        ${freckles}${facialDetail}${scar}${beard}
        <g fill="${hair}" style="color:${hair}">${hairSvg}${hairExtra}</g>
        <text x="150" y="235" text-anchor="middle" fill="${secondary}" font-size="10" class="pm-name">${GameUtils.escapeHTML(shirtName)}</text>
        <text x="150" y="277" text-anchor="middle" fill="${secondary}" font-size="38" class="pm-number">${number}</text>
        ${a.undershirt==='yes'?`<path d="M122 184h56l-8 13h-40Z" fill="#151b22"/>`:''}
      </g>
    </svg>`;
  }
  function mount(el,player,options){if(el)el.innerHTML=svg(player,options)}
  return {svg,mount};
})();

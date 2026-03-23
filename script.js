
/* ══════════════════════════════════════════
   CURSOR
══════════════════════════════════════════ */
const cur=document.getElementById('cur'),ring=document.getElementById('ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px'});
(function loop(){rx+=(mx-rx)*.13;ry+=(my-ry)*.13;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop)})();
document.querySelectorAll('a,button,.tag-b').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ring.style.width='54px';ring.style.height='54px'});
  el.addEventListener('mouseleave',()=>{ring.style.width='32px';ring.style.height='32px'});
});

/* ══════════════════════════════════════════
   ZOOM SCROLL ENGINE
   ─────────────────────────────────────────
   How it works:
   Each .scene-wrap is 200vh tall.
   The .scene inside is sticky (stays on screen).
   
   We track scroll progress through each wrap:
     p = 0.0  → wrap top just hit viewport top   (entering)
     p = 0.5  → wrap halfway through             (fully visible)
     p = 1.0  → wrap bottom hits viewport bottom (exiting)
   
   ENTER phase (p: 0 → 0.5):
     normalize t = p/0.5 → 0..1
     section: scale 1.08→1, opacity 0.12→1
     bg:      scale 1.22→1.08  (zoom-in feel)
   
   EXIT phase (p: 0.5 → 1.0):
     normalize t = (p-0.5)/0.5 → 0..1
     section: scale 1→0.94, opacity 1→0
     bg:      scale 1.08→1.20  (continues moving)
══════════════════════════════════════════ */

function lerp(a,b,t){return a+(b-a)*t}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
// ease in-out quad
function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}

const wraps=document.querySelectorAll('.scene-wrap');
const scenes=[];
wraps.forEach(wrap=>{
  const scene=wrap.querySelector('.scene');
  const bg=wrap.querySelector('.scene-bg');
  const txtEls=wrap.querySelectorAll('.sc-txt');
  scenes.push({wrap,scene,bg,txtEls,txtDone:false});
});

function tick(){
  const vh=window.innerHeight;
  const sy=window.scrollY;

  scenes.forEach(({wrap,scene,bg,txtEls,txtDone},i)=>{
    const rect=wrap.getBoundingClientRect();
    const wrapH=wrap.offsetHeight; // 200vh

    // progress 0→1 through the entire wrap
    const raw=(sy-( sy+rect.top ))/wrapH; // distance scrolled past wrap top / wrap height
    // simpler: rect.top goes from +vh (not yet) to -(wrapH) (fully past)
    // when rect.top=+vh → entering; when rect.top=-wrapH+vh → exiting
    const p=clamp((-rect.top)/(wrapH-vh),0,1); // 0 when scene pins, 1 when scene unpins

    // Split into enter(0→0.5) and exit(0.5→1)
    let sScale,sOpacity,bgScale;

    const divisor = 0.99;
// APENAS ENTRADA (sem saída)
    const enterEnd = 0.12;

    const t = ease(clamp(p / enterEnd, 0, 1));

  sScale   = lerp(1.08, 1.0, t);
  sOpacity = 1.0; // nunca some
  bgScale  = lerp(1.22, 1.08, t);

  scene.style.transform=`scale(${sScale})`;
  scene.style.opacity=sOpacity;
  bg.style.transform=`scale(${bgScale})`;

    // Stagger text in when p >= 0.35 (scene mostly in view)
    // TEXT SYNC WITH SCENE (sem delay, ligado ao zoom)
txtEls.forEach(el => {
  // entrada suave junto com a cena
  const t = ease(clamp(p / 0.25, 0, 1)); // entra rápido no começo
  // Opacidade: começa em 0 e sobe até 1. Depois trava em 1.
  el.style.opacity = t;

    // controla opacidade
  let opacity = t;
  
  // leve movimento vertical sincronizado
  const translateY = lerp(20, 0, t) 

  el.style.opacity = opacity;
  el.style.transform = `translateY(${translateY}px)`;
});
  });

  requestAnimationFrame(tick);
}

// Init all sc-txt elements to hidden
document.querySelectorAll('.sc-txt').forEach(el=>{
  el.style.opacity='0';
  el.style.transform='translateY(22px)';
});

requestAnimationFrame(tick);

/* ══════════════════════════════════════════
   SCROLL REVEAL (content sections)
══════════════════════════════════════════ */
const rvEls=document.querySelectorAll('.rv');
const rvObs=new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      // stagger siblings
      const sibs=[...e.target.parentElement.querySelectorAll('.rv')];
      const idx=sibs.indexOf(e.target);
      setTimeout(()=>e.target.classList.add('on'),idx*110);
      rvObs.unobserve(e.target);
    }
  });
},{threshold:0.15});
rvEls.forEach(el=>rvObs.observe(el));

/* Danger meters */
const meterObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.style.transform=`scaleX(${e.target.dataset.v})`;
      meterObs.unobserve(e.target);
    }
  });
},{threshold:0.5});
document.querySelectorAll('.dmfill').forEach(f=>meterObs.observe(f));



/* ══════════════════════════════════════════
   QUICK FACTS
══════════════════════════════════════════ */
const FD={
  elephant:{n:'Elefante Africano',s:'Loxodonta africana',bl:[
    {t:'Habitat',i:['Savanas ao sul do Saara','Florestas da bacia do Congo','Migra centenas de km sazonalmente']},
    {t:'Aparência',i:['Até 6 t — maior animal terrestre','Tromba com 150.000 músculos','Orelhas para termorregulação']},
    {t:'Comportamento',i:['Matriarcado com memória ancestral','Luto e empatia documentados','Infrassom a 10+ km de distância']},
    {t:'Dieta',i:['Até 150 kg de vegetação/dia','150–200 L de água diária','Semeia florestas ao defecar']},
  ]},
  lion:{n:'Leão Africano',s:'Panthera leo',bl:[
    {t:'Habitat',i:['Savanas e matas abertas','26 países — em declínio','Evita florestas fechadas']},
    {t:'Aparência',i:['Até 250 kg, juba dourada a preta','Garras retráteis de precisão','Rugido símbolo da África']},
    {t:'Comportamento',i:['Único felino social — até 30 ind.','Dorme até 20h/dia','Fêmeas fazem 90% das caças']},
    {t:'Dieta',i:['Zebras, gnus, búfalos','Machos se alimentam primeiro','Roubo de presas de outros predadores']},
  ]},
  leopard:{n:'Leopardo',s:'Panthera pardus',bl:[
    {t:'Habitat',i:['Deserto a montanhas nevadas','Maior distribuição de felino africano','Sobrevive próximo a cidades']},
    {t:'Aparência',i:['Rosetas únicas como impressão digital','Nada, sobe, corre a 60 km/h','Pelagem adapta ao ambiente']},
    {t:'Comportamento',i:['Totalmente solitário e territorial','Carrega presas 3× seu peso às árvores','Ativo à noite principalmente']},
    {t:'Dieta',i:['Oportunista — insetos a antílopes','Emboscada de alta precisão','Menor desperdício do Big 5']},
  ]},
  buffalo:{n:'Búfalo Africano',s:'Syncerus caffer',bl:[
    {t:'Habitat',i:['Pastagens com água próxima','Florestas até 4.000 m','África Subsaariana amplamente']},
    {t:'Aparência',i:['Até 900 kg e 1,7 m altura','Escudo ósseo entre os chifres','Coloração negra intensa']},
    {t:'Comportamento',i:['Manadas de até 2.000 ind.','"Votação democrática" de rota','Persegue e mata predadores']},
    {t:'Dieta',i:['Herbívoro — gramíneas e arbustos','4 câmaras estomacais','Bebe água 2× ao dia']},
  ]},
  rhino:{n:'Rinoceronte Africano',s:'Ceratotherium simum · Diceros bicornis',bl:[
    {t:'Habitat',i:['Savanas secas e matas','Branco: gramíneas · Preto: folhagem','Vasta área territorial']},
    {t:'Aparência',i:['Até 2.300 kg','Chifre de queratina pura','Pele espessa, visão fraca']},
    {t:'Comportamento',i:['Solitário e territorial','Carga a 55 km/h sem aviso','Olfato e audição excelentes']},
    {t:'Conservação',i:['~6.500 rinocerontes negros restantes','Chifre vale mais que ouro por kg','Desarmamento cirúrgico na África do Sul']},
  ]},
};

function openF(id){
  const d=FD[id];if(!d)return;
  document.getElementById('fc').innerHTML=
    `<h3>${d.n}</h3><span class="fpsp">${d.s}</span>`+
    d.bl.map(b=>`<div class="fbl"><h5>${b.t}</h5><ul>${b.i.map(i=>`<li>${i}</li>`).join('')}</ul></div>`).join('');
  document.getElementById('fo').classList.add('open');
}
function closeF(){
  const fp=document.getElementById('fp');
  fp.style.transform='translateX(100%)';
  setTimeout(()=>{document.getElementById('fo').classList.remove('open');fp.style.transform='';},520);
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeF()});



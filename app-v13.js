// Clapboard v13 — Scene Breakdown rendering fix
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let scenes=[], continuity=[], members=[];
const sample=[
{no:1,loc:"Muthu House",ie:"INT",time:"DAY",chars:"Muthu, Nandana",artists:"Hero, Heroine",props:"Phone, Tea cup",costume:"Blue shirt / Black pants",vehicle:"—",camera:"A-cam, 35mm"},
{no:2,loc:"Police Station",ie:"INT",time:"DAY",chars:"Muthu, Karthi",artists:"Hero, 2nd Hero",props:"Files, Desk phone",costume:"Same as Scene 1",vehicle:"Jeep",camera:"A-cam, 50mm"},
{no:3,loc:"Beach Road",ie:"EXT",time:"EVENING",chars:"Muthu",artists:"Hero",props:"Bike",costume:"Blue shirt / Black pants",vehicle:"Bike",camera:"Gimbal"},
{no:4,loc:"Muthu House",ie:"INT",time:"NIGHT",chars:"Muthu, Nandana",artists:"Hero, Heroine",props:"First-aid box",costume:"Change: White T-shirt",vehicle:"—",camera:"A-cam, 35mm"}
];
function renderScenes(){
 const tb=$("#sceneTable tbody");tb.innerHTML="";
 scenes.forEach((s,i)=>{let tr=document.createElement("tr");
 const fields=["no","loc","ie","time","chars","artists","props","costume","vehicle","camera"];
 tr.innerHTML=fields.map(k=>`<td><input data-i="${i}" data-k="${k}" value="${(s[k]??"").replaceAll('"',"&quot;")}"></td>`).join("")+`<td><button data-del="${i}">×</button></td>`;
 tb.appendChild(tr)});
 tb.querySelectorAll("input").forEach(x=>x.onchange=e=>{scenes[+e.target.dataset.i][e.target.dataset.k]=e.target.value;save();renderStats()});
 tb.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{scenes.splice(+b.dataset.del,1);renderScenes();save();renderStats()});
}
function renderStats(){
 $("#sceneCount").textContent=scenes.length;
 $("#dayCount").textContent=new Set(scenes.map(s=>s.day||"")).size;
 $("#locationCount").textContent=new Set(scenes.map(s=>s.loc)).size;
 $("#artistCount").textContent=new Set(scenes.flatMap(s=>String(s.artists||"").split(",").map(x=>x.trim()).filter(Boolean))).size;
}
function generateSchedule(){
 const groups={}; scenes.forEach(s=>{const key=s.loc+" • "+s.time;(groups[key]??=[]).push(s)});
 let days=Object.entries(groups).map(([k,v])=>({key:k,scenes:v}));
 $("#scheduleList").innerHTML=days.map((d,i)=>`<div class="schedule-day"><h3>Day ${i+1} — ${d.key}</h3>${d.scenes.map(s=>`<span class="scene-pill">Scene ${s.no} · ${s.ie} · ${s.chars}</span>`).join("")}</div>`).join("")||"<div class='panel'>Add scenes first.</div>";
 scenes.forEach((s,i)=>s.day=days.findIndex(d=>d.scenes.includes(s))+1); save(); renderStats();
}
function openModal(title,body){$("#modalTitle").textContent=title;$("#modalBody").innerHTML=body;$("#modal").classList.remove("hidden")}
function closeModal(){$("#modal").classList.add("hidden")}
$("#closeModal").onclick=closeModal;
$$(".tab").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));$$(".tab-panel").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#"+b.dataset.tab).classList.add("active")});
$("#addScene").onclick=()=>openModal("Add Scene",`<div class="form-grid">${["loc","ie","time","chars","artists","props","costume","vehicle","camera"].map(k=>`<label>${k.toUpperCase()}<input id="f_${k}" value=""></label>`).join("")}</div><div class="form-actions"><button id="saveScene">Add Scene</button></div>`);
$("#modal").addEventListener("click",e=>{if(e.target.id==="saveScene"){let no=scenes.length+1,s={no};["loc","ie","time","chars","artists","props","costume","vehicle","camera"].forEach(k=>s[k]=$("#f_"+k).value);scenes.push(s);closeModal();renderScenes();save();renderStats()}});
$("#generateSchedule").onclick=generateSchedule;
$("#addSample").onclick=()=>{scenes=structuredClone(sample);renderScenes();generateSchedule();};
$("#newProject").onclick=()=>{if(confirm("Start a new project?")){scenes=[];continuity=[];members=[];$("#projectName").value="Untitled Film";renderScenes();renderStats();$("#scheduleList").innerHTML="";$("#continuityList").innerHTML="";$("#teamTable tbody").innerHTML="";save()}};
$("#addContinuity").onclick=()=>openModal("Add Continuity Note",`<div class="form-grid"><label>Scene<input id="c_scene"></label><label>Department<input id="c_dep" placeholder="Costume / Makeup / Prop"></label><label>Note<input id="c_note"></label></div><div class="form-actions"><button id="saveCont">Add</button></div>`);
$("#modal").addEventListener("click",e=>{if(e.target.id==="saveCont"){continuity.push({scene:$("#c_scene").value,dep:$("#c_dep").value,note:$("#c_note").value});closeModal();renderCont();save()}});
function renderCont(){$("#continuityList").innerHTML=continuity.map((c,i)=>`<div class="continuity-item"><b>Scene ${c.scene}</b><span><strong>${c.dep}</strong> — ${c.note}</span><button onclick="continuity.splice(${i},1);renderCont();save()">×</button></div>`).join("")||"<div class='panel muted'>No continuity notes yet.</div>"}
$("#addMember").onclick=()=>openModal("Add Team Member",`<div class="form-grid"><label>Name<input id="m_name"></label><label>Department<input id="m_dep"></label><label>Access<select id="m_access"><option>View</option><option>Edit</option><option>Admin</option></select></label></div><div class="form-actions"><button id="saveMember">Add</button></div>`);
$("#modal").addEventListener("click",e=>{if(e.target.id==="saveMember"){members.push({name:$("#m_name").value,dep:$("#m_dep").value,access:$("#m_access").value});closeModal();renderMembers();save()}});
function renderMembers(){$("#teamTable tbody").innerHTML=members.map((m,i)=>`<tr><td>${m.name}</td><td>${m.dep}</td><td>${m.access}</td><td><button onclick="members.splice(${i},1);renderMembers();save()">×</button></td></tr>`).join("")}
function save(){localStorage.setItem("shootingChart",JSON.stringify({project:$("#projectName").value,director:$("#director").value,scenes,continuity,members}))}
function load(){try{let x=JSON.parse(localStorage.getItem("shootingChart"));if(x){$("#projectName").value=x.project||"Untitled Film";$("#director").value=x.director||"Unais S";scenes=x.scenes||[];continuity=x.continuity||[];members=x.members||[]}}catch{}renderScenes();renderStats();renderCont();renderMembers()}


// Clapboard v7 — robust screenplay analysis
let screenplayText="";

function normText(t){
  return String(t||"").replace(/\u00a0/g," ").replace(/\r/g,"").replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();
}
function linesOf(t){return normText(t).split("\n").map(s=>s.trim()).filter(Boolean)}

// Screenplay-aware parser for the actual Koodothram format:
// Scene label -> time/interior-exterior -> location(s) -> action/dialogue.
// "Sequence" lines are kept inside the current scene and never treated as new scenes.
function sceneBlocks(t){
  const ls=linesOf(t), out=[];
  const scene=/^(?:സീൻ|സീന്|scene|sc\.)\s*([0-9]{1,3})(?:\s*([A-Z]))?(?:\s*[-.)])?\s*$/i;
  const sceneLoose=/^(?:സീൻ|സീന്|scene)\s*([0-9]{1,3})(?:\s*([A-Z]))?\b/i;
  const timeLine=/^(?:(DAY|NIGHT|MORNING|EVENING|AFTERNOON|DAWN|DUSK|NITE)\s*[/ -]\s*)?(?:(INT|EXT|INTERIOR|EXTERIOR)(?:\s*\+\s*(INT|EXT))?)(?:\s*\+?\s*(DAY|NIGHT|MORNING|EVENING|AFTERNOON|DAWN|DUSK|NITE))?/i;
  const timeOnly=/^(DAY|NIGHT|MORNING|EVENING|AFTERNOON|DAWN|DUSK|NITE)\s*[/ -]?\s*(INT|EXT|INTERIOR|EXTERIOR)?(?:\s*\+\s*(INT|EXT))?/i;
  const std=/^(INT\/EXT|I\/E|INT|EXT)\.?\s+/i;
  let cur=null;
  function add(){if(cur){cur.body=cur.body||[];out.push(cur);cur=null}}
  function classifyTime(s){
    const u=s.toUpperCase();
    if(/NIGHT|NITE/.test(u))return 'NIGHT'; if(/MORNING|DAWN/.test(u))return 'MORNING';
    if(/EVENING|DUSK/.test(u))return 'EVENING'; if(/AFTERNOON/.test(u))return 'AFTERNOON';
    if(/DAY/.test(u))return 'DAY'; return 'UNSPECIFIED';
  }
  function classifyIE(s){
    const u=s.toUpperCase(); if(/INT\/EXT|I\/E/.test(u))return 'INT/EXT';
    const hasI=/\bINT(?:ERIOR)?\b/.test(u), hasE=/\bEXT(?:ERIOR)?\b/.test(u);
    return hasI&&hasE?'INT/EXT':hasI?'INT':hasE?'EXT':'—';
  }
  for(let i=0;i<ls.length;i++){
    const l=ls[i];
    const m=l.match(scene)||l.match(sceneLoose);
    if(m){
      add();
      cur={h:l,body:[],sceneNo:m[1]+(m[2]||''),loc:'',ie:'—',time:'UNSPECIFIED'};
      // In this screenplay the next one or two lines carry metadata.
      const n1=ls[i+1]||'', n2=ls[i+2]||'';
      if(/^(?:DAY|NIGHT|MORNING|EVENING|AFTERNOON|DAWN|DUSK|NITE)\s*[/ -]?\s*(?:INT|EXT|INTERIOR|EXTERIOR)?/i.test(n1) || /^(?:INT|EXT|INTERIOR|EXTERIOR).*\b(?:DAY|NIGHT|MORNING|EVENING|AFTERNOON|DAWN|DUSK|NITE)\b/i.test(n1)){
        cur.ie=classifyIE(n1);cur.time=classifyTime(n1);
        if(n2 && !scene.test(n2) && !/^sequence\b/i.test(n2) && !/^സീക്വൻസ്\b/i.test(n2)){cur.loc=n2;i+=2;}
        else i+=1;
      } else if(std.test(n1)){
        cur.ie=classifyIE(n1);cur.time=classifyTime(n1); if(n2){cur.loc=n2;i+=2;} else i+=1;
      } else if(n1 && !scene.test(n1) && !/^sequence\b/i.test(n1) && !/^സീക്വൻസ്\b/i.test(n1)){
        // Scene heading followed by a location without a separate time line.
        cur.loc=n1;
        if(n2 && !scene.test(n2) && (/DAY|NIGHT|MORNING|EVENING|AFTERNOON|DAWN|DUSK|NITE|INT|EXT/i.test(n2))){cur.ie=classifyIE(n2);cur.time=classifyTime(n2);i+=2;}
        else i+=1;
      }
      continue;
    }
    // Standard screenplay headings can appear without a "Scene" label.
    if(std.test(l)){
      add();cur={h:l,body:[],sceneNo:String(out.length+1),loc:l.replace(std,'').trim(),ie:classifyIE(l),time:classifyTime(l)};continue;
    }
    if(cur)cur.body.push(l);
  }
  add();
  // De-duplicate accidental empty/metadata-only blocks and retain exact scene numbering.
  return out.filter(b=>b.sceneNo||b.body.length);
}
function parseHeading(h,i){
  const x=String(h||'').trim();
  return {ie:'—',time:'UNSPECIFIED',loc:x.replace(/^(?:INT\/EXT|I\/E|INT|EXT|SCENE|സീൻ|സീന്|രംഗം)\.?\s*/i,'').replace(/^\d{1,3}[\s.)-]+/,'').trim()||('Scene '+(i+1))};
}
function extractCharacters(body){
  const found=[];
  for(const raw of body){
    const l=raw.trim();
    const m=l.match(/^([A-Z][A-Z0-9 .,'&()_-]{1,35})(?:\s*\([^)]*\))?$/);
    if(m){
      const n=m[1].trim();
      if(!/^(INT|EXT|DAY|NIGHT|MORNING|EVENING|AFTERNOON|CUT TO|FADE|DISSOLVE|CONTINUED|THE END|SCENE)$/i.test(n)&&!found.includes(n))found.push(n);
    }
  }
  return found.slice(0,15);
}
function detect(text, dict){
  const out=[];
  dict.forEach(x=>{if(new RegExp("(^|\\W)"+x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"($|\\W)","iu").test(text))out.push(x);});
  return out.length?out.join(", "):"—";
}
function analyzeScreenplay(){
  const raw=normText(screenplayText);
  if(!raw){ alert("Please choose a screenplay first."); return; }
  const blocks=sceneBlocks(raw);
  scenes=blocks.map((b,i)=>{
    const p=parseHeading(b.h,i); if(b.loc) p.loc=b.loc; if(b.ie) p.ie=b.ie; if(b.time) p.time=b.time; const body=b.body.join(" ");
    const ch=extractCharacters(b.body);
    return {
      no:i+1, loc:p.loc, ie:p.ie, time:p.time,
      chars:ch.join(", ")||"Review screenplay",
      artists:ch.length?ch.map(x=>"Cast: "+x).join(", "):"To be cast",
      props:detect(body,["phone","mobile","gun","pistol","bag","file","files","laptop","key","watch","wallet","bottle","glass","cup","book","letter","photo","umbrella","helmet","camera","ടേബിൾ","ഫോൺ","തോക്ക്","ബാഗ്","കീ"]),
      costume:detect(body,["black","white","blue","red","green","yellow","shirt","t-shirt","pants","jeans","dress","saree","uniform","jacket","ഷർട്ട്","പാന്റ്","സാരി","യൂണിഫോം"]),
      vehicle:detect(body,["car","bike","motorcycle","scooter","auto","taxi","bus","jeep","truck","van","innova","കാർ","ബൈക്ക്","ഓട്ടോ","ബസ്","ജീപ്പ്"]),
      camera:detect(body,["gimbal","drone","steadicam","handheld","35mm","50mm","85mm","macro","crane"])||"Standard camera setup"
    };
  });
  renderScenes(); generateSchedule(); save(); renderStats();
  // Make the result unmistakable on the Dashboard.
  const box=document.querySelector("#aiBreakdown")||document.querySelector(".ai-breakdown");
  if(box) box.innerHTML="<h2>AI Breakdown</h2><p><b>Analysis complete:</b> "+scenes.length+" scene(s) detected.</p><p>Open <b>Scenes</b> or <b>Shooting Chart</b> below to review and edit the breakdown.</p>";
  const tab=document.querySelector('[data-tab="scenes"]'); if(tab)tab.click();
}
async function readFile(file){
  const name=file.name||"";
  if(/\.txt$/i.test(name))return normText(await file.text());
  if(/\.docx$/i.test(name)){
    if(!window.mammoth){
      await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
    }
    // HTML conversion preserves Word paragraph boundaries much better on iPhone.
    const r=await mammoth.convertToHtml({arrayBuffer:await file.arrayBuffer()});
    const doc=new DOMParser().parseFromString(r.value,"text/html");
    const ps=[...doc.querySelectorAll("p,h1,h2,h3,li")].map(e=>e.textContent.trim()).filter(Boolean);
    return normText(ps.join("\n"));
  }
  if(/\.pdf$/i.test(name)){
    if(!window.pdfjsLib){
      await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
    const pages=[];
    for(let i=1;i<=pdf.numPages;i++){
      const page=await pdf.getPage(i), c=await page.getTextContent(), items=c.items||[];
      // Reconstruct approximate lines from Y coordinates.
      const rows=[];
      items.forEach(it=>{
        const y=it.transform?Math.round(it.transform[5]/2)*2:0;
        let row=rows.find(r=>Math.abs(r.y-y)<=3);
        if(!row){row={y,parts:[]};rows.push(row);}
        row.parts.push(it.str);
      });
      rows.sort((a,b)=>b.y-a.y);
      pages.push(rows.map(r=>r.parts.join(" ")).join("\n"));
    }
    return normText(pages.join("\n\n"));
  }
  throw new Error("Unsupported file type");
}
(function(){
  const input=$("#scriptFile"), status=$("#fileStatus"), btn=$("#analyzeScript");
  if(!input||!status||!btn)return;
  btn.disabled=true;
  input.addEventListener("change",async e=>{
    const f=e.target.files&&e.target.files[0];
    if(!f){status.textContent="No screenplay uploaded";btn.disabled=true;screenplayText="";return;}
    btn.disabled=false; status.textContent=f.name+" • selected";
    try{
      status.textContent=f.name+" • reading…";
      screenplayText=await readFile(f);
      if(!screenplayText)throw new Error("No readable text");
      status.textContent=f.name+" • ready";
      btn.disabled=false;
    }catch(err){
      console.error(err);
      screenplayText="";
      status.textContent=f.name+" • selected (tap Analyze to retry)";
      btn.disabled=false;
    }
  });
  btn.onclick=()=>analyzeScreenplay();
})();
load();

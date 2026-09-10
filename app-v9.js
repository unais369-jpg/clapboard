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
 $("#artistCount").textContent=new Set(scenes.flatMap(s=>s.artists.split(",").map(x=>x.trim()).filter(Boolean))).size;
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
function linesOf(t){
  return normText(t).split("\n").map(s=>s.trim()).filter(Boolean);
}
function sceneBlocks(t){
  const ls=linesOf(t), blocks=[];
  // Standard headings, numbered scenes, Malayalam/English scene labels, and location-time lines.
  const heading=/^(INT\.?|EXT\.?|INT\/EXT\.?|I\/E\.?)(\s+|$)/i;
  const numbered=/^(?:SCENE\s*)?\d{1,3}[\s.)-]+/i;
  const labelled=/^(?:SCENE|സീൻ|രംഗം)\s*\d*/i;
  const time=/\b(DAY|NIGHT|MORNING|EVENING|AFTERNOON|DAWN|DUSK|DAYTIME|NITE)\b/i;
  let cur=null;
  for(let i=0;i<ls.length;i++){
    const l=ls[i];
    const isHead=heading.test(l)||numbered.test(l)||labelled.test(l)||(time.test(l)&&(/[-–—:|]/.test(l)||i===0));
    if(isHead){
      if(cur)blocks.push(cur);
      cur={h:l, body:[]};
    }else if(cur) cur.body.push(l);
  }
  if(cur)blocks.push(cur);
  // If no headings were detected, create useful blocks from paragraph groups.
  if(!blocks.length){
    const paras=normText(t).split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
    paras.forEach((p,i)=>blocks.push({h:"SCENE "+(i+1),body:p.split("\n")}));
  }
  return blocks;
}
function parseHeading(h,i){
  const x=h.trim(), u=x.toUpperCase();
  let ie="";
  if(/^INT\/EXT|^I\/E/.test(u))ie="INT/EXT";
  else if(/^INT/.test(u))ie="INT";
  else if(/^EXT/.test(u))ie="EXT";
  else if(/\b(INT|INTERIOR)\b/i.test(u))ie="INT";
  else if(/\b(EXT|EXTERIOR)\b/i.test(u))ie="EXT";
  const time=/\b(NIGHT|NITE)\b/i.test(x)?"NIGHT":
             /\b(MORNING|DAWN)\b/i.test(x)?"MORNING":
             /\b(EVENING|DUSK)\b/i.test(x)?"EVENING":
             /\b(AFTERNOON)\b/i.test(x)?"AFTERNOON":
             /\b(DAY|DAYTIME)\b/i.test(x)?"DAY":"UNSPECIFIED";
  let loc=x.replace(/^(?:INT\/EXT|I\/E|INT|EXT|SCENE|സീൻ|രംഗം)\.?\s*/i,"");
  loc=loc.replace(/^\d{1,3}[\s.)-]+/,"");
  loc=loc.replace(/\s*[-–—|:]\s*(?:DAY|NIGHT|NITE|MORNING|EVENING|AFTERNOON|DAWN|DUSK|DAYTIME)\b.*$/i,"").trim();
  return {ie:ie||"—",time,loc:loc||("Scene "+(i+1))};
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
    const p=parseHeading(b.h,i), body=b.body.join(" ");
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

// Clapboard v8 — isolated Analyze action
(function(){
  const oldBtn=document.getElementById("analyzeScript");
  if(!oldBtn)return;
  const btn=oldBtn.cloneNode(true);
  oldBtn.replaceWith(btn);

  function showResult(rows){
    const tb=document.querySelector("#sceneTable tbody");
    if(!tb)return;
    tb.innerHTML="";
    rows.forEach((s,i)=>{
      const tr=document.createElement("tr");
      const fields=["no","loc","ie","time","chars","artists","props","costume","vehicle","camera"];
      fields.forEach(k=>{
        const td=document.createElement("td"), inp=document.createElement("input");
        inp.value=s[k]??""; inp.dataset.i=i; inp.dataset.k=k;
        td.appendChild(inp); tr.appendChild(td);
      });
      const td=document.createElement("td"); const del=document.createElement("button");
      del.textContent="×"; del.onclick=()=>{tr.remove();}; td.appendChild(del); tr.appendChild(td);
      tb.appendChild(tr);
    });
    const sc=document.getElementById("sceneCount"), lc=document.getElementById("locationCount"), ac=document.getElementById("artistCount");
    if(sc)sc.textContent=rows.length;
    if(lc)lc.textContent=new Set(rows.map(x=>x.loc)).size;
    if(ac)ac.textContent=new Set(rows.flatMap(x=>String(x.chars).split(",").map(y=>y.trim()).filter(Boolean))).size;
  }

  btn.onclick=async function(ev){
    ev.preventDefault();
    const status=document.getElementById("fileStatus");
    try{
      if(!screenplayText){
        if(status)status.textContent="No screenplay text available — please choose the file again";
        alert("Please choose the screenplay again.");
        return;
      }
      btn.disabled=true;
      btn.textContent="✨ Analyzing…";

      // Reuse v7's parser functions, but keep rendering independent.
      const blocks=sceneBlocks(screenplayText);
      const rows=blocks.map((b,i)=>{
        const p=parseHeading(b.h,i), body=b.body.join(" "), ch=extractCharacters(b.body);
        return {
          no:i+1,loc:p.loc,ie:p.ie,time:p.time,
          chars:ch.join(", ")||"Review screenplay",
          artists:ch.length?ch.join(", "):"To be cast",
          props:detect(body,["phone","mobile","gun","pistol","bag","file","files","laptop","key","watch","wallet","bottle","glass","cup","book","letter","photo","umbrella","helmet","camera","ഫോൺ","തോക്ക്","ബാഗ്"]),
          costume:detect(body,["black","white","blue","red","green","yellow","shirt","t-shirt","pants","jeans","dress","saree","uniform","jacket","ഷർട്ട്","പാന്റ്","സാരി","യൂണിഫോം"]),
          vehicle:detect(body,["car","bike","motorcycle","scooter","auto","taxi","bus","jeep","truck","van","innova","കാർ","ബൈക്ക്","ഓട്ടോ","ബസ്","ജീപ്പ്"]),
          camera:detect(body,["gimbal","drone","steadicam","handheld","35mm","50mm","85mm","macro","crane"])||"Standard camera setup"
        };
      });
      scenes=rows;
      showResult(rows);
      save();
      if(status)status.textContent="Analysis complete • "+rows.length+" scene(s) detected";
      btn.textContent="✓ Analysis Complete";
      // Switch to Scenes tab.
      const tab=document.querySelector('.tab[data-tab="scenes"]');
      if(tab)tab.click();
      window.scrollTo({top:document.querySelector("#sceneTable")?.offsetTop||0,behavior:"smooth"});
    }catch(err){
      console.error(err);
      if(status)status.textContent="Analysis error • "+(err.message||"unknown error");
      alert("Analysis failed: "+(err.message||"unknown error"));
      btn.disabled=false;
      btn.textContent="✨ Analyze Screenplay";
    }
  };
})();

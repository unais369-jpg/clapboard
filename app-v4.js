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
$("#scriptFile").onchange=e=>{$("#fileStatus").textContent=e.target.files[0]?e.target.files[0].name:"No screenplay uploaded"};
$("#addContinuity").onclick=()=>openModal("Add Continuity Note",`<div class="form-grid"><label>Scene<input id="c_scene"></label><label>Department<input id="c_dep" placeholder="Costume / Makeup / Prop"></label><label>Note<input id="c_note"></label></div><div class="form-actions"><button id="saveCont">Add</button></div>`);
$("#modal").addEventListener("click",e=>{if(e.target.id==="saveCont"){continuity.push({scene:$("#c_scene").value,dep:$("#c_dep").value,note:$("#c_note").value});closeModal();renderCont();save()}});
function renderCont(){$("#continuityList").innerHTML=continuity.map((c,i)=>`<div class="continuity-item"><b>Scene ${c.scene}</b><span><strong>${c.dep}</strong> — ${c.note}</span><button onclick="continuity.splice(${i},1);renderCont();save()">×</button></div>`).join("")||"<div class='panel muted'>No continuity notes yet.</div>"}
$("#addMember").onclick=()=>openModal("Add Team Member",`<div class="form-grid"><label>Name<input id="m_name"></label><label>Department<input id="m_dep"></label><label>Access<select id="m_access"><option>View</option><option>Edit</option><option>Admin</option></select></label></div><div class="form-actions"><button id="saveMember">Add</button></div>`);
$("#modal").addEventListener("click",e=>{if(e.target.id==="saveMember"){members.push({name:$("#m_name").value,dep:$("#m_dep").value,access:$("#m_access").value});closeModal();renderMembers();save()}});
function renderMembers(){$("#teamTable tbody").innerHTML=members.map((m,i)=>`<tr><td>${m.name}</td><td>${m.dep}</td><td>${m.access}</td><td><button onclick="members.splice(${i},1);renderMembers();save()">×</button></td></tr>`).join("")}
function save(){localStorage.setItem("shootingChart",JSON.stringify({project:$("#projectName").value,director:$("#director").value,scenes,continuity,members}))}
function load(){try{let x=JSON.parse(localStorage.getItem("shootingChart"));if(x){$("#projectName").value=x.project||"Untitled Film";$("#director").value=x.director||"Unais S";scenes=x.scenes||[];continuity=x.continuity||[];members=x.members||[]}}catch{}renderScenes();renderStats();renderCont();renderMembers()}
\n// DOCX/TXT screenplay analysis prototype\nlet screenplayText="";\nfunction norm(t){return t.replace(/\\r/g,"").replace(/[ \\t]+/g," ").replace(/\\n{3,}/g,"\\n\\n").trim()}\nfunction splitScenes(t){const ls=t.split("\\n").map(x=>x.trim()).filter(Boolean), re=/^(INT\\.?|EXT\\.?|INT\\/EXT\\.?|I\\/E\\.?)\\b/i;let out=[],c=null;for(const l of ls){if(re.test(l)){if(c)out.push(c);c={h:l,ls:[]}}else if(c)c.ls.push(l)}if(c)out.push(c);return out}\nfunction head(h){let x=h.toUpperCase(),ie=/^INT\\/EXT|^I\\/E/.test(x)?"INT/EXT":/^INT/.test(x)?"INT":/^EXT/.test(x)?"EXT":"";let tm=/\\b(NIGHT|NITE)\\b/.test(x)?"NIGHT":/\\b(MORNING|DAWN)\\b/.test(x)?"MORNING":/\\b(EVENING|DUSK)\\b/.test(x)?"EVENING":/\\b(AFTERNOON)\\b/.test(x)?"AFTERNOON":/\\b(DAY|DAYTIME)\\b/.test(x)?"DAY":"";let loc=x.replace(/^(INT\\/EXT|I\\/E|INT|EXT)\\.?\\s*/,"").replace(/\\s*[-–—]\\s*(DAY|NIGHT|NITE|MORNING|EVENING|AFTERNOON|DAWN|DUSK)\\b.*$/,'').trim();return{ie,time:tm,loc:loc||"UNSPECIFIED"}}\nfunction chars(ls){const o=[];for(const l of ls){const m=l.match(/^([A-Z][A-Z0-9 .,'&-]{1,35})\\s*(?:\\([^)]*\\))?$/);if(m&&!/^(CUT TO|FADE|DISSOLVE|CONTINUED|INT|EXT|DAY|NIGHT|MORNING|EVENING|SCENE|THE END)$/.test(m[1].trim())&&!o.includes(m[1].trim()))o.push(m[1].trim())}return o.slice(0,12)}\nfunction words(t,w){const f=w.filter(x=>new RegExp("\\\\b"+x.replace("-","\\\\-")+"\\\\b","i").test(t));return f.map(x=>x[0].toUpperCase()+x.slice(1)).join(", ")||"—"}\nfunction analyzeScreenplay(){if(!screenplayText)return;const bs=splitScenes(screenplayText);if(!bs.length){alert("No standard INT/EXT scene headings were detected.");return}scenes=bs.map((b,i)=>{const p=head(b.h),body=b.ls.join(" ");return{no:i+1,loc:p.loc,ie:p.ie,time:p.time||"UNSPECIFIED",chars:chars(b.ls).join(", ")||"Review screenplay",artists:"To be cast",props:words(body,["phone","mobile","gun","pistol","bag","file","files","laptop","key","watch","wallet","bottle","glass","cup","book","letter","photo","umbrella","helmet","bike"]),costume:words(body,["black","white","blue","red","green","yellow","shirt","t-shirt","pants","jeans","dress","saree","uniform","jacket"]),vehicle:words(body,["car","bike","motorcycle","scooter","auto","taxi","bus","jeep","truck","van","innova"]),camera:words(body,["gimbal","drone","steadicam","handheld","35mm","50mm","85mm","macro","crane"])||"Standard camera setup"}});renderScenes();generateSchedule();save();renderStats();alert(`Clapboard analyzed ${scenes.length} scene(s). Please review the breakdown.`)}\n$("#scriptFile").onchange=async e=>{const f=e.target.files[0];if(!f){$("#fileStatus").textContent="No screenplay uploaded";$("#analyzeScript").disabled=true;return;}$("#fileStatus").textContent=f.name+" • reading…";try{if(/\\.docx$/i.test(f.name))screenplayText=norm((await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()})).value);else if(/\\.txt$/i.test(f.name))screenplayText=norm(await f.text());else{$("#fileStatus").textContent="PDF analysis needs the secure backend version";$("#analyzeScript").disabled=true;return}$("#fileStatus").textContent=f.name+" • ready";$("#analyzeScript").disabled=false}catch(err){console.error(err);$("#fileStatus").textContent="Could not read screenplay";$("#analyzeScript").disabled=true}};\n$("#analyzeScript").onclick=analyzeScreenplay;\n

// Clapboard v4: robust iPhone DOCX upload + analysis
(function(){
  const input=document.getElementById("scriptFile");
  const status=document.getElementById("fileStatus");
  const btn=document.getElementById("analyzeScript");
  if(!input||!status||!btn)return;

  async function ensureMammoth(){
    if(window.mammoth)return true;
    await new Promise((resolve,reject)=>{
      const s=document.createElement("script");
      s.src="https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js";
      s.onload=resolve;s.onerror=reject;document.head.appendChild(s);
    });
    return !!window.mammoth;
  }

  input.addEventListener("change", async function(){
    const f=this.files && this.files[0];
    if(!f){status.textContent="No screenplay uploaded";btn.disabled=true;screenplayText="";return;}
    // Enable immediately on iPhone selection; do not let a reader failure disable it.
    btn.disabled=false;
    status.textContent=f.name+" • selected";
    if(/\.txt$/i.test(f.name)){
      screenplayText=norm(await f.text());
      status.textContent=f.name+" • ready";
      return;
    }
    if(!/\.docx$/i.test(f.name)){
      status.textContent=f.name+" • DOCX/TXT required";
      return;
    }
    try{
      await ensureMammoth();
      const r=await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()});
      screenplayText=norm(r.value);
      status.textContent=f.name+" • ready";
    }catch(e){
      console.error(e);
      screenplayText="";
      status.textContent=f.name+" • selected (tap Analyze to retry)";
      // Keep button enabled so the user can retry.
      btn.disabled=false;
    }
  });

  btn.addEventListener("click", async function(){
    const f=input.files && input.files[0];
    if(!f){alert("Please choose your screenplay first.");return;}
    if(!screenplayText && /\.docx$/i.test(f.name)){
      try{
        status.textContent=f.name+" • reading…";
        await ensureMammoth();
        const r=await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()});
        screenplayText=norm(r.value);
      }catch(e){alert("The DOCX reader could not load. Please check the internet connection and try again.");return;}
    }
    if(screenplayText) analyzeScreenplay();
    else alert("Please choose a DOCX or TXT screenplay.");
  });
})();
load();

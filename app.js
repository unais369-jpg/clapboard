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
load();

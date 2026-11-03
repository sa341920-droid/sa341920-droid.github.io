const STORE_KEY="royal-store-demo-v1";
const starterProducts=[
{id:101,name:"Premium Mobile Case",category:"Mobile Accessories",price:850,emoji:"📱",description:"Protective case with a stylish finish."},
{id:102,name:"Fast Charging Cable",category:"Mobile Accessories",price:650,emoji:"🔌",description:"A useful everyday charging accessory."},
{id:103,name:"Custom Printed Mug",category:"Customized Gifts",price:1200,emoji:"☕",description:"A personal gift with your own design."},
{id:104,name:"Business Cards",category:"Printing",price:900,emoji:"🪪",description:"Professional cards for your business."},
{id:105,name:"Photo Print",category:"Printing",price:150,emoji:"🖼️",description:"Print your favorite memories."},
{id:106,name:"Custom T-Shirt",category:"Customized Gifts",price:1800,emoji:"👕",description:"Wear your design or message."},
{id:107,name:"Sticker / Label Sheet",category:"Printing",price:500,emoji:"🏷️",description:"Great for packaging and branding."},
{id:108,name:"Gift Printing",category:"Customized Gifts",price:1000,emoji:"🎁",description:"Personalized print for special occasions."}
];
const categories=[["Mobile Accessories","📱","Cases, cables, chargers and more."],["Printing","🖨️","Cards, prints, labels and business needs."],["Customized Gifts","🎁","Personalized products for special moments."],["Custom Products","✨","Tell us your idea and request a quote."]];
const fmt=n=>"Rs. "+Number(n).toLocaleString("en-PK");
let state;
try{state=JSON.parse(localStorage.getItem(STORE_KEY))||{products:starterProducts,requests:[],theme:0}}catch{state={products:starterProducts,requests:[],theme:0}}
let cart=[];
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(state))}
function toast(message){const el=$("toast");if(!el)return;el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}
function renderCategories(){$("category-grid").innerHTML=categories.map(c=>`<a class="category-card" href="#catalog"><div class="icon">${c[1]}</div><h3>${c[0]}</h3><p>${c[2]}</p></a>`).join("");$("category-filter").innerHTML='<option>All</option>'+[...new Set(state.products.map(p=>p.category))].map(c=>`<option>${escapeHTML(c)}</option>`).join("")}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderProducts(){const q=$("search").value.toLowerCase(),cat=$("category-filter").value;const list=state.products.filter(p=>(cat==="All"||p.category===cat)&&(p.name+" "+p.description+" "+p.category).toLowerCase().includes(q));$("product-grid").innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-art">${escapeHTML(p.emoji||"✨")}</div><div class="product-info"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description||"Made for you.")}</p><div class="price">${fmt(p.price)}</div><button class="add-btn" data-add="${p.id}">Add to cart</button></div></article>`).join(""):'<p class="muted">No products match your search.</p>'}
function updateCart(){ $("cart-count").textContent=cart.length}
$("product-grid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;const p=state.products.find(x=>x.id===Number(b.dataset.add));if(p){cart.push(p);updateCart();toast(p.name+" added (demo cart).")}});
$("cart-button").addEventListener("click",()=>{if(!cart.length){toast("Your cart is empty.");return}alert("DEMO CART\n\n"+cart.map(p=>p.name+" — "+fmt(p.price)).join("\n")+"\n\nTotal: "+fmt(cart.reduce((s,p)=>s+Number(p.price),0))+"\n\nThis is not a confirmed order. Checkout/payment is not connected.")});
$("search").addEventListener("input",renderProducts);$("category-filter").addEventListener("change",renderProducts);
const imageInput=$("reference-images");imageInput.addEventListener("change",()=>{const files=[...imageInput.files];if(files.length>20){toast("Please select no more than 20 images.");imageInput.value="";return}const box=$("image-preview");box.innerHTML="";files.forEach(file=>{if(!file.type.startsWith("image/"))return;const img=document.createElement("img");img.alt=file.name;img.src=URL.createObjectURL(file);box.appendChild(img)})});
$("custom-form").addEventListener("submit",e=>{e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form).entries());data.id=Date.now();data.createdAt=new Date().toISOString();data.imageNames=[...imageInput.files].map(f=>f.name);state.requests.unshift(data);save();form.reset();$("image-preview").innerHTML="";toast("Request saved in this browser's demo. Open Owner Panel to view it.")});
$("year").textContent=new Date().getFullYear();renderCategories();renderProducts();updateCart();
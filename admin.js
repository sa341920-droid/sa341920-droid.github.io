'use strict';
const $=id=>document.getElementById(id);
const token=()=>localStorage.getItem('rm_token');
const setStatus=(message,isError=false)=>{const el=$('status');el.textContent=message;el.style.background=isError?'#fee2e2':'#eef2f6';};
async function api(path,options={}){
  const headers={'Content-Type':'application/json',...(token()?{Authorization:'Bearer '+token()}:{}),...(options.headers||{})};
  const response=await fetch('/api'+path,{...options,headers});
  const data=await response.json().catch(()=>({error:'Server returned a non-JSON response'}));
  if(!response.ok)throw new Error(data.error||`Request failed (${response.status})`);
  return data;
}
function show(data){$('out').textContent=JSON.stringify(data,null,2);}
async function load(path){try{show(await api(path));setStatus('Loaded '+path)}catch(error){setStatus(error.message,true);show({error:error.message})}}
function formData(form){return Object.fromEntries(new FormData(form).entries());}
function numberIfPresent(obj,key){if(obj[key]!==undefined&&obj[key]!=='' )obj[key]=Number(obj[key]);else delete obj[key];}
function bool(v){return v==='true';}
async function submitAction(action,d){
 switch(action){
  case 'product': numberIfPresent(d,'pricePkr');numberIfPresent(d,'comparePricePkr');numberIfPresent(d,'stock');if(!d.categoryId)delete d.categoryId;if(!d.imageUrl)delete d.imageUrl;return api('/products',{method:'POST',body:JSON.stringify(d)});
  case 'category':return api('/admin/categories',{method:'POST',body:JSON.stringify(d)});
  case 'orderStatus':return api(`/admin/orders/${encodeURIComponent(d.id)}/status`,{method:'PATCH',body:JSON.stringify({status:d.status})});
  case 'payment':return api(`/admin/orders/${encodeURIComponent(d.id)}/payment-confirmation`,{method:'POST',body:JSON.stringify({reference:d.reference||undefined,note:d.note||undefined})});
  case 'seller':return api(`/admin/sellers/${encodeURIComponent(d.id)}`,{method:'PATCH',body:JSON.stringify({status:d.status})});
  case 'customer':return api(`/admin/customers/${encodeURIComponent(d.id)}/status`,{method:'PATCH',body:JSON.stringify({isActive:bool(d.isActive)})});
  case 'review':return api(`/admin/reviews/${encodeURIComponent(d.id)}`,{method:'PATCH',body:JSON.stringify({approved:bool(d.approved)})});
  case 'coupon':numberIfPresent(d,'value');numberIfPresent(d,'minOrderPkr');numberIfPresent(d,'usageLimit');if(!d.usageLimit)delete d.usageLimit;return api('/admin/coupons',{method:'POST',body:JSON.stringify(d)});
  case 'shipping':numberIfPresent(d,'chargePkr');numberIfPresent(d,'freeOverPkr');if(d.freeOverPkr===undefined)delete d.freeOverPkr;return api('/admin/shipping-methods',{method:'POST',body:JSON.stringify(d)});
  case 'return':return api(`/admin/returns/${encodeURIComponent(d.id)}`,{method:'PATCH',body:JSON.stringify({status:d.status,resolution:d.resolution||undefined,restockItems:!!d.restockItems})});
  case 'ticket':return api(`/admin/support/tickets/${encodeURIComponent(d.id)}`,{method:'PATCH',body:JSON.stringify({status:d.status,priority:d.priority})});
  case 'ticketMessage':return api(`/admin/support/tickets/${encodeURIComponent(d.id)}/messages`,{method:'POST',body:JSON.stringify({message:d.message})});
  case 'tracking':return api(`/admin/orders/${encodeURIComponent(d.id)}/tracking-events`,{method:'POST',body:JSON.stringify({status:d.status,trackingNumber:d.trackingNumber||undefined,shippingProvider:d.shippingProvider||undefined,location:d.location||undefined,description:d.description||undefined,estimatedDelivery:d.estimatedDelivery||undefined})});
  case 'inventory':numberIfPresent(d,'quantityChange');return api(`/admin/inventory/${encodeURIComponent(d.id)}/adjust`,{method:'POST',body:JSON.stringify({quantityChange:d.quantityChange,reason:d.reason,reference:d.reference||undefined})});
  case 'production':numberIfPresent(d,'quotationPkr');numberIfPresent(d,'productionCostPkr');return api(`/admin/production/jobs/${encodeURIComponent(d.id)}`,{method:'PATCH',body:JSON.stringify({status:d.status,quotationPkr:d.quotationPkr,productionCostPkr:d.productionCostPkr,productionNotes:d.productionNotes||undefined,qualityNotes:d.qualityNotes||undefined})});
  case 'page':{const slug=d.slug;delete d.slug;return api(`/admin/pages/${encodeURIComponent(slug)}`,{method:'PUT',body:JSON.stringify(d)});}
  case 'setting':{let value;try{value=JSON.parse(d.value)}catch{throw new Error('Setting value must be valid JSON')};return api('/admin/storefront/settings',{method:'PUT',body:JSON.stringify({key:d.key,value})});}
  case 'shippingEdit':{const id=d.id;delete d.id;if(d.chargePkr==='')delete d.chargePkr;else numberIfPresent(d,'chargePkr');if(!d.name)delete d.name;d.enabled=bool(d.enabled);return api(`/admin/shipping-methods/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(d)});}
  case 'productEdit':{const id=d.id;delete d.id;for(const k of ['pricePkr','stock'])numberIfPresent(d,k);if(!d.name)delete d.name;if(!d.pricePkr&&d.pricePkr!==0)delete d.pricePkr;if(!d.stock&&d.stock!==0)delete d.stock;if(!d.status)delete d.status;return api(`/admin/products/${encodeURIComponent(id)}`,{method:'PATCH',body:JSON.stringify(d)});}
  case 'pos':{let items;try{items=JSON.parse(d.items)}catch{throw new Error('POS items must be valid JSON')};if(!Array.isArray(items))throw new Error('POS items must be a JSON array');return api('/admin/pos/sales',{method:'POST',body:JSON.stringify({items,paymentMethod:d.paymentMethod,customerName:d.customerName||'Walk-in customer',phone:d.phone||'',notes:d.notes||undefined})});}
  case 'expense':numberIfPresent(d,'amountPkr');if(!d.reference)delete d.reference;if(!d.entryDate)delete d.entryDate;return api('/admin/accounting/expenses',{method:'POST',body:JSON.stringify(d)});
  case 'campaign':{let audience={};if(d.audience){try{audience=JSON.parse(d.audience)}catch{throw new Error('Audience filter must be valid JSON')}}delete d.audience;if(!d.subject)delete d.subject;if(!d.scheduledAt)delete d.scheduledAt;else d.scheduledAt=new Date(d.scheduledAt).toISOString();return api('/admin/campaigns',{method:'POST',body:JSON.stringify({...d,audience})});}
  case 'variant':{const id=d.id;delete d.id;numberIfPresent(d,'pricePkr');numberIfPresent(d,'stock');for(const k of ['sku','barcode','size','color','material'])if(!d[k])delete d[k];return api(`/admin/products/${encodeURIComponent(id)}/variants`,{method:'POST',body:JSON.stringify(d)});}
  case 'variantEdit':{const id=d.id,variantId=d.variantId;delete d.id;delete d.variantId;for(const k of ['pricePkr','stock'])numberIfPresent(d,k);for(const k of ['sku','barcode','size','color','material'])if(!d[k])delete d[k];return api(`/admin/products/${encodeURIComponent(id)}/variants/${encodeURIComponent(variantId)}`,{method:'PATCH',body:JSON.stringify(d)});}
  default:throw new Error('Unknown action');
 }
}
async function checkSession(){
 if(!token()){showLogin();return;}
 try{const me=await api('/me');if(me?.role!=='ADMIN'){setStatus('This account does not have Owner/Admin permission.',true);$('dashboard').classList.add('hidden');$('ownerBar').classList.add('hidden');return;}
  $('ownerName').textContent=`Signed in: ${me.name} · ${me.email}`;$('ownerBar').classList.remove('hidden');$('dashboard').classList.remove('hidden');$('loginForm').classList.add('hidden');setStatus('Owner session verified.');await load('/admin/summary');
 }catch(error){localStorage.removeItem('rm_token');showLogin();setStatus(error.message,true);}
}
function showLogin(){$('loginForm').classList.remove('hidden');$('ownerBar').classList.add('hidden');$('dashboard').classList.add('hidden');setStatus('Please sign in with your Owner account.');}
$('loginForm').addEventListener('submit',async event=>{event.preventDefault();try{const credentials=formData(event.currentTarget);const result=await api('/auth/login',{method:'POST',body:JSON.stringify(credentials)});localStorage.setItem('rm_token',result.token);await checkSession();}catch(error){setStatus(error.message,true);}});
$('logout').addEventListener('click',()=>{localStorage.removeItem('rm_token');showLogin();});
$('refreshSummary').addEventListener('click',()=>load('/admin/summary'));
document.querySelectorAll('[data-path]').forEach(button=>button.addEventListener('click',()=>{
 let path=button.dataset.path;
 if(button.dataset.needsId==='product'){const id=$('productIdForMoves').value.trim();if(!id){setStatus('Enter a product UUID first.',true);return;}path=path.replace('PLACEHOLDER',encodeURIComponent(id));}
 load(path);
}));
document.querySelectorAll('form[data-action]').forEach(form=>form.addEventListener('submit',async event=>{
 event.preventDefault();try{const data=formData(form);const result=await submitAction(form.dataset.action,data);show(result);setStatus('Action completed successfully.');}catch(error){show({error:error.message});setStatus(error.message,true);}
}));
$('loadMoves').addEventListener('click',()=>{const id=$('productIdForMoves').value.trim();if(!id){setStatus('Enter a product UUID.',true);return;}load(`/admin/inventory/${encodeURIComponent(id)}/movements`);});
$('clearResult').addEventListener('click',()=>show({message:'Ready'}));
checkSession();

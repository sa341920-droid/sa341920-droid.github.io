require("dotenv").config();
const express=require("express");
const cors=require("cors");
const helmet=require("helmet");
const app=express();
const PORT=process.env.PORT||3000;
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static("."));
let products=require("./seed");
let orders=[];
app.get("/api/health",(req,res)=>res.json({ok:true,service:"Royal Marketplace API"}));
app.get("/api/products",(req,res)=>res.json(products));
app.get("/api/products/:id",(req,res)=>{
 const p=products.find(x=>String(x.id)===req.params.id);
 if(!p)return res.status(404).json({error:"Product not found"});
 res.json(p);
});
app.post("/api/products",(req,res)=>{
 const {name,category,price,stock,emoji,desc}=req.body||{};
 if(!name||!category||!Number.isFinite(Number(price)))return res.status(400).json({error:"name, category and numeric price are required"});
 const product={id:Date.now(),name,category,price:Number(price),stock:Number(stock||0),emoji:emoji||"📦",rating:5,desc:desc||""};
 products.push(product);res.status(201).json(product);
});
app.delete("/api/products/:id",(req,res)=>{
 const old=products.length;products=products.filter(p=>String(p.id)!==req.params.id);
 if(old===products.length)return res.status(404).json({error:"Product not found"});
 res.json({ok:true});
});
app.post("/api/orders",(req,res)=>{
 const {customer,items}=req.body||{};
 if(!customer||!Array.isArray(items)||!items.length)return res.status(400).json({error:"Customer and items are required"});
 let total=0,checked=[];
 for(const item of items){
  const p=products.find(x=>String(x.id)===String(item.id));
  const qty=Number(item.qty);
  if(!p||!Number.isInteger(qty)||qty<1||p.stock<qty)return res.status(400).json({error:"Invalid product or insufficient stock"});
  checked.push({id:p.id,name:p.name,qty,price:p.price});total+=p.price*qty;
 }
 checked.forEach(i=>{products.find(p=>p.id===i.id).stock-=i.qty});
 const order={id:"RM"+Date.now().toString().slice(-8),createdAt:new Date().toISOString(),status:"Order received",customer,items:checked,total};
 orders.unshift(order);res.status(201).json(order);
});
app.get("/api/orders",(req,res)=>res.json(orders));
app.patch("/api/orders/:id/status",(req,res)=>{
 const allowed=["Order received","Confirmed","Processing","Shipped","Delivered","Cancelled","Refund requested","Refunded"];
 if(!allowed.includes(req.body.status))return res.status(400).json({error:"Invalid status"});
 const o=orders.find(x=>x.id===req.params.id);if(!o)return res.status(404).json({error:"Order not found"});
 o.status=req.body.status;res.json(o);
});
app.listen(PORT,()=>console.log(`Royal Marketplace API running at http://localhost:${PORT}`));

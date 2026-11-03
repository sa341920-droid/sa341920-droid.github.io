const jwt=require('jsonwebtoken'),bcrypt=require('bcryptjs');
function sign(user){return jwt.sign({sub:user.id,role:user.role,email:user.email},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'1h',issuer:'royal-marketplace'})}
async function hashPassword(p){return bcrypt.hash(p,12)}
async function comparePassword(p,h){return bcrypt.compare(p,h)}
function auth(req,res,next){const h=req.headers.authorization||'';if(!h.startsWith('Bearer '))return res.status(401).json({error:'Authentication required'});try{req.user=jwt.verify(h.slice(7),process.env.JWT_SECRET,{issuer:'royal-marketplace'});next()}catch{return res.status(401).json({error:'Invalid or expired token'})}}
function allow(...roles){return(req,res,next)=>{if(!req.user||!roles.includes(req.user.role))return res.status(403).json({error:'Insufficient permission'});next()}}
module.exports={sign,hashPassword,comparePassword,auth,allow};

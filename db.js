const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new sqlite3.Database(path.join(dataDir, 'royal_store.db'));

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows)));
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (error, row) => error ? reject(error) : resolve(row)));
}

const themes = [
  ['Royal Gold','#f4c95d','#1f2937','#fbf5e7','#121826'],['Midnight Blue','#64b5f6','#0f172a','#e2e8f0','#0f172a'],['Emerald Luxe','#10b981','#052e2b','#ecfdf5','#052e2b'],['Crimson Glow','#f43f5e','#4c0519','#fff1f2','#4c0519'],['Sunset Orange','#f97316','#431407','#fff7ed','#431407'],['Royal Violet','#8b5cf6','#2e1065','#f5f3ff','#2e1065'],['Mint Wave','#14b8a6','#042f2e','#f0fdfa','#042f2e'],['Slate Steel','#94a3b8','#0f172a','#f8fafc','#0f172a'],['Rosewood','#fb7185','#4c0519','#fff1f2','#4c0519'],['Ocean Teal','#06b6d4','#083344','#ecfeff','#083344'],['Amber Dark','#fbbf24','#451a03','#fffbeb','#451a03'],['Forest Green','#22c55e','#052e16','#f0fdf4','#052e16'],['Coral Pop','#ff7f50','#451a03','#fff7ed','#451a03'],['Plum Night','#d946ef','#3b0764','#fdf4ff','#3b0764'],['Soft Beige','#d97706','#3f2d1b','#fef3c7','#3f2d1b'],['Deep Navy','#60a5fa','#0f172a','#eff6ff','#0f172a'],['Pink Candy','#ec4899','#500724','#fdf2f8','#500724'],['Lime Fresh','#84cc16','#1a2e05','#f7fee7','#1a2e05'],['Silver Frost','#cbd5e1','#1e293b','#f8fafc','#1e293b'],['Deep Maroon','#ef4444','#3f0d0d','#fef2f2','#3f0d0d']
];
const settings = {storeName:'Royal Mobile And Printing Store',storeTagline:'Print • Create • Customize',phone:'03040011041',whatsapp:'03040011041',email:'',address:'Faisalabad, Punjab, Pakistan',businessHours:'Mon-Sat: 9:00 AM - 9:00 PM',currency:'PKR',taxRate:'0',themeId:'1'};
const categories = [['Mobile Accessories','📱','Cases, cables, chargers and phone essentials.'],['Printing','🖨️','Business cards, photo printing, labels and posters.'],['Customized Gifts','🎁','Mugs, T-shirts, shawls and personalized gifts.'],['Caps & Apparel','🧢','Custom caps, uniforms and branded clothing.'],['Sublimation','🧵','Sublimation printing and branded textile products.'],['Office Supplies','📝','Printed office essentials.'],['Home Decor','🏠','Wall art, frames and home printed accents.']];
const names = ['Premium Mobile Case','Fast Charging Cable','Wireless Earbuds','Power Bank','Screen Protector','Phone Stand','Car Charger','Bluetooth Speaker','USB Cable','Phone Grip','Business Cards','Photo Prints','Sticker Sheet','Poster Print','Menu Printing','Brochure Set','Event Banner','Label Roll','Booklet Printing','Receipt Books','Custom Printed Mug','Custom T-Shirt','Printed Shawl','Photo Frame Gift','Personalized Keychain','Nameplate','Custom Cushion','Printed Tote Bag','Engraved Pen','Gift Box Print','Cap with Logo','Sublimation Tumbler','Desk Calendar','Frame Print','Printing Ink Set','Custom Mug Set','Acrylic Sign','Vinyl Banner','Metal Keychain','Custom Notebook','Laptop Sleeve','Tablet Case','Printer Paper','Heat Transfer Vinyl','Wall Poster','Gift Tag Set','Office Signboard','Bottle Label Pack','Wireless Mouse','Keyboard Cover','Custom ID Card','Packaging Box','Corporate Folder','Logo Wristband','Custom Badges','Leather Wallet','Power Adapter','Audio Cable','Travel Charger','Smartwatch Charger','Premium Box Set','Wedding Card Set','Invitation Cards','Thank You Cards','Custom Puzzle','Photo Book','Custom Coaster','Printed Memo Pad','Calendar Planner','Mobile Film Pack','Inkjet Cartridge','Laser Toner','Business Notebook','Calendar Stand','Foam Board Print','Phone Lens Kit','Tablet Stand','Laptop Skin','Gift Hamper Print','Travel Organizer','Design Portfolio Print','Universal Charger','Magnetic Cable','Phone Cleaning Kit','Fabric Print Sheet','Bulk Gift Bag','Event Name Badge','Custom Cap','Sublimation Shirt','Printed Apron','Water Bottle','Custom Mouse Pad','Branded Lanyard','Photo Magnet','Custom Placemat','Satin Ribbon Print','Custom Envelope','Flyer Printing','Catalog Printing','Custom Stamp','Wall Decal','Desk Name Plate','Wedding Favor','Printed Cushion','Custom Calendar','Phone Case Design','Charging Adapter','Wireless Charger','Earphone Case','Printer Cartridge','Canvas Print','Acrylic Keychain','Custom Badge Set','Heat Press Transfer','Custom Shawl Print','Card Holder','Logo Sticker Roll'];
const categoryFor = (index) => categories[index % categories.length][0];
async function seedDefaults() {
  await run('PRAGMA foreign_keys = ON');
  await run('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  await run('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, icon TEXT, description TEXT)');
  await run(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,category TEXT NOT NULL,sku TEXT UNIQUE,description TEXT,price REAL NOT NULL,wholesale_price REAL,cost REAL,stock INTEGER NOT NULL DEFAULT 0,tags TEXT,image TEXT,featured INTEGER NOT NULL DEFAULT 0,visible INTEGER NOT NULL DEFAULT 1,variant TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  await run(`CREATE TABLE IF NOT EXISTS custom_requests (id INTEGER PRIMARY KEY AUTOINCREMENT,customer_name TEXT NOT NULL,phone TEXT NOT NULL,email TEXT,product_name TEXT NOT NULL,category TEXT,description TEXT NOT NULL,quantity INTEGER NOT NULL DEFAULT 1,budget TEXT,desired_date TEXT,size TEXT,color TEXT,material TEXT,printing_method TEXT,design_notes TEXT,status TEXT NOT NULL DEFAULT 'Submitted',notes TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  await run('CREATE TABLE IF NOT EXISTS themes (id INTEGER PRIMARY KEY, name TEXT NOT NULL, accent TEXT, secondary TEXT, surface TEXT, text TEXT, active INTEGER DEFAULT 0)');
  await run('CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT,customer_name TEXT,phone TEXT,status TEXT DEFAULT \'Pending\',total REAL DEFAULT 0,items TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP)');
  for (const [key,value] of Object.entries(settings)) await run('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)',[key,String(value)]);
  for (let i=0;i<categories.length;i++) await run('INSERT OR IGNORE INTO categories(name,icon,description) VALUES(?,?,?)',categories[i]);
  for (let i=0;i<themes.length;i++) await run('INSERT OR IGNORE INTO themes(id,name,accent,secondary,surface,text,active) VALUES(?,?,?,?,?,?,?)',[i+1,...themes[i],i===0?1:0]);
  const count = await get('SELECT COUNT(*) AS count FROM products');
  if (!count.count) {
    for (let i=0;i<names.length;i++) {
      const price=350+((i*73)%9000);
      await run('INSERT OR IGNORE INTO products(name,category,sku,description,price,wholesale_price,cost,stock,tags,featured,variant) VALUES(?,?,?,?,?,?,?,?,?,?,?)',[names[i],categoryFor(i),`RMS-${String(i+1001).padStart(5,'0')}`,`Premium ${names[i].toLowerCase()} prepared for retail and custom branding.`,price,Math.round(price*.82),Math.round(price*.64),6+(i%30),'retail,custom',i%9===0?1:0,'size: standard|color: assorted']);
    }
  }
}
module.exports={db,run,all,get,seedDefaults,themes};

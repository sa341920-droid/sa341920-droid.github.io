const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'royal_store.db');

fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve({ lastID: this?.lastID });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function parseJSON(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

const defaultSettings = {
  storeName: 'Royal Mobile And Printing Store',
  storeTagline: 'Print • Create • Customize',
  phone: '03040011041',
  whatsapp: '03040011041',
  email: 'hello@royalstore.example',
  address: 'Faisalabad, Punjab, Pakistan',
  businessHours: 'Mon-Sat: 9:00 AM - 9:00 PM',
  currency: 'PKR',
  taxRate: '0.10',
  themeId: '1',
  logoText: 'ROYAL MOBILE',
  coverTitle: 'Your idea. Our royal touch.'
};

const defaultThemes = [
  { id: 1, name: 'Royal Gold', accent: '#f4c95d', secondary: '#1f2937', surface: '#fbf5e7', text: '#121826' },
  { id: 2, name: 'Midnight Blue', accent: '#64b5f6', secondary: '#0f172a', surface: '#e2e8f0', text: '#0f172a' },
  { id: 3, name: 'Emerald Luxe', accent: '#10b981', secondary: '#052e2b', surface: '#ecfdf5', text: '#052e2b' },
  { id: 4, name: 'Crimson Glow', accent: '#f43f5e', secondary: '#4c0519', surface: '#fff1f2', text: '#4c0519' },
  { id: 5, name: 'Sunset Orange', accent: '#f97316', secondary: '#431407', surface: '#fff7ed', text: '#431407' },
  { id: 6, name: 'Royal Violet', accent: '#8b5cf6', secondary: '#2e1065', surface: '#f5f3ff', text: '#2e1065' },
  { id: 7, name: 'Mint Wave', accent: '#14b8a6', secondary: '#042f2e', surface: '#f0fdfa', text: '#042f2e' },
  { id: 8, name: 'Slate Steel', accent: '#94a3b8', secondary: '#0f172a', surface: '#f8fafc', text: '#0f172a' },
  { id: 9, name: 'Rosewood', accent: '#fb7185', secondary: '#4c0519', surface: '#fff1f2', text: '#4c0519' },
  { id: 10, name: 'Ocean Teal', accent: '#06b6d4', secondary: '#083344', surface: '#ecfeff', text: '#083344' },
  { id: 11, name: 'Amber Dark', accent: '#fbbf24', secondary: '#451a03', surface: '#fffbeb', text: '#451a03' },
  { id: 12, name: 'Forest Green', accent: '#22c55e', secondary: '#052e16', surface: '#f0fdf4', text: '#052e16' },
  { id: 13, name: 'Coral Pop', accent: '#ff7f50', secondary: '#451a03', surface: '#fff7ed', text: '#451a03' },
  { id: 14, name: 'Plum Night', accent: '#d946ef', secondary: '#3b0764', surface: '#fdf4ff', text: '#3b0764' },
  { id: 15, name: 'Soft Beige', accent: '#d97706', secondary: '#3f2d1b', surface: '#fef3c7', text: '#3f2d1b' },
  { id: 16, name: 'Deep Navy', accent: '#60a5fa', secondary: '#0f172a', surface: '#eff6ff', text: '#0f172a' },
  { id: 17, name: 'Pink Candy', accent: '#ec4899', secondary: '#500724', surface: '#fdf2f8', text: '#500724' },
  { id: 18, name: 'Lime Fresh', accent: '#84cc16', secondary: '#1a2e05', surface: '#f7fee7', text: '#1a2e05' },
  { id: 19, name: 'Silver Frost', accent: '#cbd5e1', secondary: '#1e293b', surface: '#f8fafc', text: '#1e293b' },
  { id: 20, name: 'Deep Maroon', accent: '#ef4444', secondary: '#3f0d0d', surface: '#fef2f2', text: '#3f0d0d' }
];

function seedDefaults() {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        await run(`
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          )
        `);

        await run(`
          CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            icon TEXT,
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            sku TEXT,
            description TEXT,
            price REAL NOT NULL,
            wholesale_price REAL,
            cost REAL,
            stock INTEGER DEFAULT 0,
            tags TEXT,
            image TEXT,
            featured INTEGER DEFAULT 0,
            visible INTEGER DEFAULT 1,
            variant TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await run(`
          CREATE TABLE IF NOT EXISTS custom_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT,
            phone TEXT,
            email TEXT,
            product_name TEXT,
            category TEXT,
            description TEXT,
            quantity INTEGER,
            budget TEXT,
            desired_date TEXT,
            size TEXT,
            color TEXT,
            material TEXT,
            printing_method TEXT,
            design_notes TEXT,
            status TEXT DEFAULT 'Submitted',
            notes TEXT,
            images TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await run(`
          CREATE TABLE IF NOT EXISTS themes (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            accent TEXT,
            secondary TEXT,
            surface TEXT,
            text TEXT,
            active INTEGER DEFAULT 0
          )
        `);

        await run(`
          CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT,
            phone TEXT,
            status TEXT DEFAULT 'Pending',
            total REAL DEFAULT 0,
            items TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        const settingsRows = await all('SELECT key FROM settings');
        if (!settingsRows.length) {
          const settingsInsert = Object.entries(defaultSettings).map(([key, value]) => {
            return run('INSERT INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
          });
          await Promise.all(settingsInsert);
        }

        const themeCount = await get('SELECT COUNT(*) as c FROM themes');
        if (!themeCount || themeCount.c === 0) {
          const themeInserts = defaultThemes.map((theme) => run(
            'INSERT INTO themes (id, name, accent, secondary, surface, text, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [theme.id, theme.name, theme.accent, theme.secondary, theme.surface, theme.text, theme.id === 1 ? 1 : 0]
          ));
          await Promise.all(themeInserts);
        }

        const categoryRows = await all('SELECT name FROM categories');
        if (!categoryRows.length) {
          const categorySeed = [
            ['Mobile Accessories', '📱', 'Protective cases, chargers, cables and phone essentials.'],
            ['Printing', '🖨️', 'Business cards, photo printing, labels and posters.'],
            ['Customized Gifts', '🎁', 'Mugs, T-shirts, shawls and personalized gifts.'],
            ['Caps & Apparel', '🧢', 'Custom caps, uniforms and branded clothing.'],
            ['Sublimation', '🧵', 'Sublimation printing and branded textile products.'],
            ['Office Supplies', '📝', 'Planners, journals and printed office essentials.'],
            ['Home Decor', '🏠', 'Wall art, frames and home printed accents.']
          ];

          for (const [name, icon, description] of categorySeed) {
            await run('INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)', [name, icon, description]);
          }
        }

        const productCount = await get('SELECT COUNT(*) as count FROM products');
        if (!productCount || productCount.count === 0) {
          const baseProducts = [
            ['Premium Mobile Case', 'Mobile Accessories', 'MC-1001', 'Protective case with stylish finish and grip support.', 850, 700, 550, 24, 'case,phone,accessory', 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?auto=format&fit=crop&w=900&q=80', 1, 1, 'size: regular|color: black,rose,blue'],
            ['Fast Charging Cable', 'Mobile Accessories', 'MC-1002', 'Reliable cable for fast charging and data transfer.', 650, 520, 390, 40, 'charger,cable,phone', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80', 1, 1, 'length: 1m|color: black'],
            ['Wireless Earbuds', 'Mobile Accessories', 'MC-1003', 'Portable sound with deep bass and crystal clear calls.', 2800, 2350, 1900, 16, 'audio,earbuds,wireless', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80', 0, 1, 'color: white,black'],
            ['Power Bank 20000mAh', 'Mobile Accessories', 'MC-1004', 'Travel-ready power bank with smart charging protection.', 3200, 2700, 2200, 8, 'power,backup,travel', 'https://images.unsplash.com/photo-1609091839405-2c4f5d50a5d7?auto=format&fit=crop&w=900&q=80', 0, 1, 'capacity: 20000mAh|color: black'],
            ['Business Card Pack', 'Printing', 'PR-2001', 'Premium printed business cards for professional branding.', 900, 760, 620, 55, 'business,printing,branding', 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80', 1, 1, 'size: A4|finish: matte'],
            ['Photo Print Set', 'Printing', 'PR-2002', 'Printed memories and family portraits on premium paper.', 150, 120, 90, 90, 'photo,print,frame', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80', 0, 1, 'paper: glossy|size: 4x6'],
            ['Custom Printed Mug', 'Customized Gifts', 'CG-3001', 'High-quality mug with custom design and your text.', 1200, 980, 760, 30, 'mug,gift,custom', 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80', 1, 1, 'capacity: 350ml|color: white'],
            ['Custom T-Shirt', 'Customized Gifts', 'CG-3002', 'Comfortable T-shirt printed with your logo or name.', 1800, 1500, 1100, 22, 'shirt,custom,print', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', 0, 1, 'size: S-XL|color: black,white'],
            ['Printed Shawl', 'Customized Gifts', 'CG-3003', 'Elegant scarf for gifting and promotional branding.', 2200, 1800, 1450, 12, 'shawl,gift,print', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', 0, 1, 'fabric: cotton|size: standard'],
            ['Cap with Logo', 'Caps & Apparel', 'CA-4001', 'Custom printed cap for events, shops and team branding.', 2100, 1750, 1300, 18, 'cap,apparel,brand', 'https://images.unsplash.com/photo-1521369909026-2afed882baee?auto=format&fit=crop&w=900&q=80', 0, 1, 'size: M,L,XL|color: navy,black'],
            ['Sublimation Tumbler', 'Sublimation', 'SB-5001', 'Heat pressed tumbler with durable printed finish.', 1600, 1380, 1060, 26, 'tumbler,drinkware,custom', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80', 0, 1, 'capacity: 600ml|color: rose,black'],
            ['Desk Calendar', 'Office Supplies', 'OS-6001', 'Yearly desk companion with your brand or artwork.', 800, 670, 500, 28, 'calendar,office,branding', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80', 0, 1, 'size: A5|paper: matte'],
            ['Frame Print', 'Home Decor', 'HD-7001', 'Decorative frame print for home and office décor.', 1400, 1200, 920, 14, 'frame,decor,home', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80', 0, 1, 'size: 8x10|frame: walnut'],
            ['Printing Ink Set', 'Printing', 'PR-2003', 'Reliable printing consumables for daily store usage.', 2200, 1900, 1500, 11, 'ink,printing,materials', 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=900&q=80', 0, 1, 'type: CMYK|quantity: 1 set']
          ];

          let productInsertQueue = [];
          const allProductNames = [
            'Premium Mobile Case','Fast Charging Cable','Wireless Earbuds','Power Bank 20000mAh','Phone Lens Kit','USB Hub','Car Charger','Screen Protector','Bluetooth Speaker','Magnetic Holder',
            'Business Card Pack','Photo Print Set','Sticker Sheet','Poster Print','Menu Printing','Brochure Set','Gift Box Print','Booklet Printing','Event Banner','Label Roll',
            'Custom Printed Mug','Custom T-Shirt','Printed Shawl','Photo Frame Gift','Personalized Keychain','Nameplate','Sublimation Cap','Custom Cushion','Printed Tote Bag','Engraved Pen',
            'Cap with Logo','Sublimation Tumbler','Desk Calendar','Frame Print','Printing Ink Set','Custom Mug Set','White Mug','Black Mug','Acrylic Sign','Vinyl Banner','Metal Keychain',
            'Smart Watch Band','Mobile Stand','Phone Cleaning Kit','Printer Paper','Heat Transfer Vinyl','Fabric Print Sheet','Wall Poster','Sticker Pack','Gift Tag Set','Custom Notebook',
            'Office Signboard','Bottle Label Pack','Laptop Sleeve','Tablet Sleeve','Universal Charger','Magnetic Cable','Wireless Mouse','Keyboard Cover','Tablet Stand','Phone Grill Case',
            'Bulk Gift Bag','Event Name Badge','Custom ID Card','Travel Organizer','Design Portfolio Print','Packaging Box','Printed Folder','Calendar Stand','Foam Board Print','Receipt Books',
            'Laptop Skin','Tablet Case','Mobile Film Pack','Inkjet Cartridge','Laser Toner','Print Tray','Business Notebook','Corporate Folder','Logo Wristband','Custom Badges',
            'Leather Wallet','Car Mount','Power Adapter','Audio Cable','Display Protector','Camera Lens Cap','SIM Tray Tool','Travel Charger','Smartwatch Charger','Phone Grip',
            'Premium Box Set','Gift Hamper Print','Wedding Card Set','Invitation Cards','Thank You Cards','Custom Puzzle','Photo Book','Custom Coaster','Printed Memo Pad','Calendar Planner'
          ];

          for (let idx = 0; idx < allProductNames.length; idx++) {
            const name = allProductNames[idx];
            const category = idx % 7 === 0 ? 'Mobile Accessories' : idx % 7 === 1 ? 'Printing' : idx % 7 === 2 ? 'Customized Gifts' : idx % 7 === 3 ? 'Caps & Apparel' : idx % 7 === 4 ? 'Sublimation' : idx % 7 === 5 ? 'Office Supplies' : 'Home Decor';
            const price = 350 + ((idx * 73) % 9000);
            const stock = 6 + (idx % 30);
            const description = `Premium ${name.toLowerCase()} prepared for retail and custom branding needs.`;
            const sku = `RMS-${String(idx + 1001).padStart(5, '0')}`;
            productInsertQueue.push(run(
              'INSERT INTO products (name, category, sku, description, price, wholesale_price, cost, stock, tags, image, featured, visible, variant) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [name, category, sku, description, price, Math.max(200, price * 0.82), Math.max(150, price * 0.64), stock, 'featured,retail,custom', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', idx % 4 === 0 ? 1 : 0, 1, 'color: standard|size: standard']
            ));
          }

          await Promise.all(productInsertQueue.concat(baseProducts.map(([name, category, sku, description, price, wholesale_price, cost, stock, tags, image, featured, visible, variant]) => run(
            'INSERT INTO products (name, category, sku, description, price, wholesale_price, cost, stock, tags, image, featured, visible, variant) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, category, sku, description, price, wholesale_price, cost, stock, tags, image, featured, visible, variant]
          ))));
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = {
  db,
  all,
  get,
  run,
  parseJSON,
  defaultThemes,
  seedDefaults,
  defaultSettings
};

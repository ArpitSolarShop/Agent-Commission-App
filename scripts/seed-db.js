/* eslint-disable @typescript-eslint/no-require-imports */
// Seed script using sql.js (WASM) so no native build tools are required
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const seedData = require('../src/data/seedData');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'products.db');
if (!fs.existsSync(path.dirname(dbPath))) fs.mkdirSync(path.dirname(dbPath), { recursive: true });
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT,
      kWp REAL,
      phase INTEGER,
      module INTEGER,
      qty INTEGER,
      price INTEGER,
      wire INTEGER,
      outOfVns INTEGER
    );
  `);

  const insertStmt = db.prepare('INSERT INTO products (source,kWp,phase,module,qty,price,wire,outOfVns) VALUES (?,?,?,?,?,?,?,?)');

  function insertMany(source, arr) {
    for (const it of arr) {
      insertStmt.run([source, it.kWp, it.phase, it.module, it.qty, it.price, it.wire, it.outOfVns]);
    }
  }

  insertMany('base', seedData.products);
  insertMany('tata', seedData.tataProducts);
  insertMany('waaree_topcon', seedData.waareeTopconProducts);
  insertMany('waaree_dcr', seedData.waareeHybridDcrProducts);
  insertMany('waaree_ndcr', seedData.waareeHybridNDcrProducts);

  insertStmt.free();

  const binary = db.export();
  const buffer = Buffer.from(binary);
  fs.writeFileSync(dbPath, buffer);

  // Query counts
  const res = db.exec('SELECT source, COUNT(*) as cnt FROM products GROUP BY source');
  console.log('Seed complete. Row counts by source:');
  if (res.length > 0) {
    const values = res[0].values; // array of [source, count]
    for (const row of values) {
      console.log(`${row[0]}: ${row[1]}`);
    }
  }
  const totalRes = db.exec('SELECT COUNT(*) as cnt FROM products');
  if (totalRes.length > 0) console.log('Total products:', totalRes[0].values[0][0]);
  console.log('DB file at:', dbPath);
  db.close();
})();

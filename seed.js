/* ==========================================================
   SEED SCRIPT — Populate default users & products
   Run: node seed.js
   ========================================================== */
import { createUser, addProduct, getUser, getProducts } from "./database.js";

console.log("🌱 Seeding database...\n");

/* ── Default Users ── */
const users = [
  { username: "agent", password: "agent123", role: "agent" },
  { username: "cashier", password: "cashier123", role: "cashier" },
  { username: "admin", password: "admin123", role: "admin" },
];

for (const u of users) {
  try {
    if (!getUser(u.username)) {
      createUser(u.username, u.password, u.role);
      console.log(`  ✅ User created: ${u.username} (${u.role})`);
    } else {
      console.log(`  ⏩ User exists:  ${u.username}`);
    }
  } catch (err) {
    console.log(`  ⏩ User exists:  ${u.username}`);
  }
}

/* ── Default Products ── */
const products = [
  { name: "Coffee", price: 500, category: "Beverages" },
  { name: "Water Bottle", price: 300, category: "Beverages" },
  { name: "Juice", price: 700, category: "Beverages" },
  { name: "Sandwich", price: 1200, category: "Food" },
  { name: "Snack Pack", price: 800, category: "Food" },
  { name: "Full Lunch", price: 2500, category: "Food" },
];

const existing = getProducts();
if (existing.length === 0) {
  for (const p of products) {
    addProduct(p.name, p.price, p.category);
    console.log(`  ✅ Product added: ${p.name} ($${p.price})`);
  }
} else {
  console.log(`  ⏩ Products already seeded (${existing.length} found)`);
}

console.log("\n✅ Seed complete!");
process.exit(0);

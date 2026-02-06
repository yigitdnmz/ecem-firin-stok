import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴 Firebase config (AYNI CONFIG)
const firebaseConfig = {
  apiKey: "AIzaSyBbI2I2qyi8OfIPZvtp-ImkVOTec8VbM2k",
  authDomain: "ecem-firin-stok.firebaseapp.com",
  projectId: "ecem-firin-stok",
  storageBucket: "ecem-firin-stok.firebasestorage.app",
  messagingSenderId: "99634330468",
  appId: "1:99634330468:web:cca79eba162a07cee0d871"
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const col = collection(db, "products");

let data = [];

// Firestore realtime dinleme
onSnapshot(ref,snap=>{
  data = snap.docs.map(d=>({...d.data(),id:d.id}));
  render();
  loadGroups();
});


// ➕ EKLE
window.add = async () => {
  const name = document.getElementById("name").value.trim();
  const group = document.getElementById("group").value.trim();

  if (!name) return;

  await addDoc(col, {
    name,
    group,
    stock: 0
  });

  document.getElementById("name").value = "";
  document.getElementById("group").value = "";
};

// 🔁 LİSTELE
window.render = () => {
  const q = document.getElementById("search").value.toLowerCase();
  const list = document.getElementById("list");

  list.innerHTML = "";

  data
    .filter(x => x.name.toLowerCase().includes(q))
    .forEach(x => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${x.name}</strong> (${x.stock})
        <span>
          <button onclick="updateStock('${x.id}', 1)">+</button>
          <button onclick="updateStock('${x.id}', -1)">-</button>
          <button onclick="removeItem('${x.id}')">🗑️</button>
        </span>
      `;
      list.appendChild(li);
    });
};

// ➕➖ STOK GÜNCELLE
window.updateStock = async (id, val) => {
  const item = data.find(x => x.id === id);
  if (!item) return;

  await updateDoc(doc(db, "products", id), {
    stock: item.stock + val
  });
};

// 🗑️ SİL (ONAYLI)
window.removeItem = async (id) => {
  const ok = confirm("Bu ürünü silmek istediğine emin misin?");
  if (!ok) return;

  await deleteDoc(doc(db, "products", id));
};

function calculateTotals() {
  let total = 0;
  const groups = {};

  data.forEach(x => {
    total += x.stock;
    groups[x.group] = (groups[x.group] || 0) + x.stock;
  });

  document.getElementById("totalStock").innerText = total;

  const groupDiv = document.getElementById("groupTotals");
  groupDiv.innerHTML = Object.entries(groups)
    .map(([g, v]) => `<div><strong>${g}</strong>: ${v}</div>`)
    .join("");
}

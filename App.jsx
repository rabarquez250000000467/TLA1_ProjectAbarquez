// LocalStorage Initial State
let categories = JSON.parse(localStorage.getItem('income_categories_vanilla')) || [
  {
    id: 1,
    name: 'Consulting Services',
    description: 'Enterprise technical support contract',
    amount: 12500,
    status: 'Active'
  },
  {
    id: 2,
    name: 'SaaS Subscriptions',
    description: 'Monthly recurring software revenue',
    amount: 8400,
    status: 'Active'
  }
];

// DOM Elements
const form = document.getElementById('category-form');
const editIdInput = document.getElementById('edit-id');
const nameInput = document.getElementById('category-name');
const amountInput = document.getElementById('category-amount');
const statusInput = document.getElementById('category-status');
const descInput = document.getElementById('category-desc');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const tableBody = document.getElementById('category-table-body');

const statTotal = document.getElementById('stat-total');
const statActive = document.getElementById('stat-active');
const statRevenue = document.getElementById('stat-revenue');

const clearBtn = document.getElementById('clear-btn');
const exportBtn = document.getElementById('export-btn');

// Save Categories to LocalStorage
function saveCategories() {
  localStorage.setItem('income_categories_vanilla', JSON.stringify(categories));
  render();
}

// Render UI & Table
function render() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedStatus = statusFilter.value;

  // Filter Categories
  const filtered = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm) || cat.description.toLowerCase().includes(searchTerm);
    const matchesStatus = selectedStatus === 'All' || cat.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Render Stats
  const activeCount = categories.filter(c => c.status === 'Active').length;
  const activeRevenue = categories
    .filter(c => c.status === 'Active')
    .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  statTotal.textContent = categories.length;
  statActive.textContent = activeCount;
  statRevenue.textContent = `$${activeRevenue.toLocaleString()}`;

  // Render Table Rows
  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colSpan="5" class="empty-state">No matching income categories found.</td>
      </tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(cat => `
    <tr>
      <td><strong class="category-title">${escapeHtml(cat.name)}</strong></td>
      <td class="text-muted">${escapeHtml(cat.description)}</td>
      <td class="amount-cell">$${(parseFloat(cat.amount) || 0).toLocaleString()}</td>
      <td>
        <span class="badge badge-${cat.status.toLowerCase()}">${cat.status}</span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-edit" onclick="handleEdit(${cat.id})">Edit</button>
          <button class="btn-delete" onclick="handleDelete(${cat.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Form Submission (Add or Edit)
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value) || 0;
  const status = statusInput.value;
  const desc = descInput.value.trim();
  const editId = editIdInput.value;

  if (!name) return;

  if (editId) {
    // Edit existing
    categories = categories.map(cat => cat.id == editId ? { ...cat, name, amount, status, description: desc } : cat);
    resetForm();
  } else {
    // Add new
    const newCat = {
      id: Date.now(),
      name,
      amount,
      status,
      description: desc || 'No description provided'
    };
    categories.unshift(newCat);
    resetForm();
  }

  saveCategories();
});

// Edit Category
window.handleEdit = function(id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) return;

  editIdInput.value = cat.id;
  nameInput.value = cat.name;
  amountInput.value = cat.amount;
  statusInput.value = cat.status;
  descInput.value = cat.description;

  formTitle.textContent = '✏️ Edit Income Category';
  submitBtn.textContent = 'Update Category';
  cancelEditBtn.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Cancel Edit Mode
cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  editIdInput.value = '';
  form.reset();
  formTitle.textContent = '➕ Register New Income Category';
  submitBtn.textContent = 'Save Category';
  cancelEditBtn.classList.add('hidden');
}

// Delete Category
window.handleDelete = function(id) {
  categories = categories.filter(c => c.id !== id);
  saveCategories();
};

// Clear All Data
clearBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all registered categories?')) {
    categories = [];
    saveCategories();
  }
});

// Export JSON
exportBtn.addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(categories, null, 2));
  const dl = document.createElement('a');
  dl.setAttribute("href", dataStr);
  dl.setAttribute("download", `income_categories_${Date.now()}.json`);
  document.body.appendChild(dl);
  dl.click();
  dl.remove();
});

// Real-time Search & Filter Event Listeners
searchInput.addEventListener('input', render);
statusFilter.addEventListener('change', render);

// Helper function to escape HTML string
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Initial Render
render();
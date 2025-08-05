import { useEffect, useState } from "react";
import axios from "axios";
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Stack from '@mui/material/Stack';

const API_URL = "https://inventory-system-back-end-production.up.railway.app/api/items";



function Icome() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Load data
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const startEdit = (product) => {
    setEditProduct(product);
    setShowModal(true);
  };

  const clearEdit = () => {
    setEditProduct(null);
    setShowModal(false);
  };

  const saveProduct = async (product) => {
    try {
      if (product._id) {
        await axios.put(`${API_URL}/${product._id}`, product);
      } else {
        await axios.post(API_URL, product);
      }
      await fetchProducts();
      clearEdit();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setProducts(ps => ps.filter(p => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(search.toLowerCase()) ||
    product.sku?.toLowerCase().includes(search.toLowerCase()) ||
    product.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <Button
            onClick={() => { setEditProduct(null); setShowModal(true); }}
            type="button"
            variant="contained"
            endIcon={<AddShoppingCartIcon />}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#115293' },
            }}
          >
            Add Product
          </Button>
        </header>

        <div className="mb-4 flex flex-row gap-2">
          <input
            className="w-full md:w-72 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 bg-white"
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-auto rounded shadow bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Price ($)</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product._id}>
                    <td className="px-4 py-3 font-medium text-gray-700">{product.name}</td>
                    <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                    <td className="px-4 py-3 text-gray-500">{product.category}</td>
                    <td className={`px-4 py-3 text-gray-500 font-mono ${product.quantity <= 5 ? 'bg-red-50 text-red-700 font-bold rounded' : ''}`}>
                      {product.quantity}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Stack direction="row" spacing={2}>
                        <Button onClick={() => deleteProduct(product._id)} variant="outlined" color="error" startIcon={<DeleteIcon />}>
                          Delete
                        </Button>
                        <Button onClick={() => startEdit(product)} variant="contained" endIcon={<EditIcon />}>
                          Edit
                        </Button>
                      </Stack>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={editProduct}
          onSave={saveProduct}
          onCancel={clearEdit}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onSave, onCancel }) {
  const [form, setForm] = useState(
    product ?? { name: "", sku: "", category: "", quantity: 0, price: 0 }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.sku) return;
    onSave({ ...form, _id: product?._id });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-xl font-bold mb-4">{product ? 'Edit' : 'Add'} Product</h2>
        <div className="flex flex-col gap-3 mb-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name" className="border px-3 py-2 rounded" required />
          <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" className="border px-3 py-2 rounded" required />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="border px-3 py-2 rounded" />
          <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} placeholder="Quantity" className="border px-3 py-2 rounded" />
          <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} placeholder="Price" className="border px-3 py-2 rounded" />
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button type="button" onClick={onCancel} className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
          <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
        </div>
      </form>
    </div>
  );
}

export default Icome;

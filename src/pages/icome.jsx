import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const API_URL = "https://inventory-system-back-end-production.up.railway.app/api/items";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

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
      fetchProducts();
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
      console.error("Delete error", err);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(search.toLowerCase()) ||
    product.sku?.toLowerCase().includes(search.toLowerCase()) ||
    product.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">Inventory Managemens</Typography>
        <Button
          variant="contained"
          endIcon={<AddShoppingCartIcon />}
          onClick={() => { setEditProduct(null); setShowModal(true); }}
        >
          Add Product
        </Button>
      </Box>

      <TextField
        label="Search products"
        variant="outlined"
        value={search}
        onChange={e => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 3, maxWidth: 300 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Price ($)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No products found</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map(product => (
                <TableRow key={product._id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell
                    sx={{
                      color: product.quantity <= 5 ? 'error.main' : 'text.primary',
                      fontWeight: product.quantity <= 5 ? 'bold' : 'normal'
                    }}
                  >
                    {product.quantity}
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteProduct(product._id)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        endIcon={<EditIcon />}
                        onClick={() => startEdit(product)}
                      >
                        Edit
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <ProductModal open={showModal} onClose={clearEdit} onSave={saveProduct} product={editProduct} />
    </Box>
  );
}

function ProductModal({ open, onClose, onSave, product }) {
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    price: 0
  });

  useEffect(() => {
    if (product) setForm(product);
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === 'quantity' || name === 'price' ? Number(value) : value
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.sku) return;
    onSave({ ...form, _id: product?._id });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField name="name" label="Product Name" value={form.name} onChange={handleChange} required />
        <TextField name="sku" label="SKU" value={form.sku} onChange={handleChange} required />
        <TextField name="category" label="Category" value={form.category} onChange={handleChange} />
        <TextField name="quantity" type="number" label="Quantity" value={form.quantity} onChange={handleChange} />
        <TextField name="price" type="number" label="Price ($)" value={form.price} onChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );  
}

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Product, Order, User, UserRole, OrderStatus } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// Local Database Files
const DATA_DIR = path.resolve("./data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Ensure Data Directory and Files Exist
function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Seed Users if not present (default admin and user)
  if (!fs.existsSync(USERS_FILE)) {
    const seedUsers: User[] = [
      {
        id: "usr_admin",
        email: "admin@store.com",
        name: "Admin User",
        role: "admin",
        createdAt: new Date().toISOString()
      },
      {
        id: "usr_buyer",
        email: "customer@store.com",
        name: "John Customer",
        role: "user",
        createdAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2), "utf8");
  }

  // Seed Products if not present
  if (!fs.existsSync(PRODUCTS_FILE)) {
    const seedProducts: Product[] = [
      {
        id: "prod_1",
        name: "AeroSound Pro Headphones",
        description: "Adaptive active noise cancellation, high-fidelity spatial audio, and 40-hour ultra-extended hybrid battery life. Perfect for focus and long travel.",
        price: 299.99,
        category: "Audio",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
        stock: 15,
        featured: true
      },
      {
        id: "prod_2",
        name: "KeyCraft Mechanical Keyboard",
        description: "Compact 75% hot-swappable tactile mechanical keyboard featuring custom dampened pre-lubed switches and premium dye-sub PBT keycaps.",
        price: 149.99,
        category: "Accessories",
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600",
        stock: 22,
        featured: true
      },
      {
        id: "prod_3",
        name: "Horizon Wool Table Mat",
        description: "Water-resistant, biodegradable merino felt desk pad designed to structure your modern workspace and protect key peripherals.",
        price: 45.00,
        category: "Office",
        imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600",
        stock: 40
      },
      {
        id: "prod_4",
        name: "Lumina Minimalist Table Lamp",
        description: "Circadian-aware smart lamp with full-spectrum dimming, custom ambient temperature preset profiles, and touch-sensitive brush brass stand.",
        price: 89.00,
        category: "Office",
        imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600",
        stock: 8,
        featured: true
      },
      {
        id: "prod_5",
        name: "Glass Brew Drip Carafe",
        description: "Temperature-resilient double-walled borosilicate glass pour-over device paired with laser-cut reusable brass micro-filter.",
        price: 54.50,
        category: "Kitchen",
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
        stock: 12
      },
      {
        id: "prod_6",
        name: "Apex Waterproof Utility Pack",
        description: "Eco-friendly recycled polyester 22L everyday technical backpack with separate floating padded compartment for notebook protection.",
        price: 125.00,
        category: "Travel",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600",
        stock: 18,
        featured: true
      }
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seedProducts, null, 2), "utf8");
  }

  // Seed Orders (empty array if not present)
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

initDatabase();

// Helpers to Read & Write
function readData<T>(filePath: string): T {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (e) {
    return [] as unknown as T;
  }
}

function writeData<T>(filePath: string, data: T) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Simple Session State Store (Memory Cache for Active Login)
// In a full production app, we would use signed cookies or proper JWTs.
// Here we support simple Auth Header check mapping to the users database.
function extractUserFromHeader(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const email = authHeader.replace("Bearer ", "").trim();
  const users = readData<User[]>(USERS_FILE);
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// Authentication Middlewares
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = extractUserFromHeader(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized. Please login." });
    return;
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = extractUserFromHeader(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Access denied. Administrator privileges required." });
    return;
  }
  (req as any).user = user;
  next();
}

// ==========================================
// API ROUTES
// ==========================================

// --- Auth Endpoints ---

// Register
app.post("/api/auth/register", (req, res) => {
  const { email, name, role } = req.body;
  if (!email || !name) {
    res.status(400).json({ error: "Email and Name are required fields." });
    return;
  }

  const users = readData<User[]>(USERS_FILE);
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    res.status(400).json({ error: "User with this email already exists." });
    return;
  }

  const targetRole: UserRole = role === "admin" ? "admin" : "user";
  const newUser: User = {
    id: "usr_" + Math.random().toString(36).substr(2, 9),
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role: targetRole,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeData(USERS_FILE, users);

  res.status(201).json({
    user: newUser,
    token: newUser.email
  });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email verification is required." });
    return;
  }

  const users = readData<User[]>(USERS_FILE);
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    res.status(404).json({ error: "User profile not found. Please click 'Register' to create it." });
    return;
  }

  res.json({
    user,
    token: user.email
  });
});

// Current User State Recovery
app.get("/api/auth/me", (req, res) => {
  const user = extractUserFromHeader(req);
  if (!user) {
    res.status(401).json({ error: "No active session." });
    return;
  }
  res.json(user);
});

// --- Product Endpoints ---

// List products
app.get("/api/products", (req, res) => {
  const products = readData<Product[]>(PRODUCTS_FILE);
  const { category, search } = req.query;

  let filtered = [...products];

  if (category && category !== "All") {
    filtered = filtered.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const term = (search as string).toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  }

  res.json(filtered);
});

// Single product details
app.get("/api/products/:id", (req, res) => {
  const products = readData<Product[]>(PRODUCTS_FILE);
  const found = products.find(p => p.id === req.params.id);
  if (!found) {
    res.status(404).json({ error: `Product ID ${req.params.id} does not exist.` });
    return;
  }
  res.json(found);
});

// Create product (Admin)
app.post("/api/products", requireAdmin, (req, res) => {
  const { name, description, price, category, imageUrl, stock, featured } = req.body;

  if (!name || !description || price === undefined || !category || !imageUrl || stock === undefined) {
    res.status(400).json({ error: "All properties (name, description, price, category, imageUrl, stock) are required." });
    return;
  }

  const products = readData<Product[]>(PRODUCTS_FILE);
  const newProduct: Product = {
    id: "prod_" + Math.random().toString(36).substr(2, 9),
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    category: category.trim(),
    imageUrl: imageUrl.trim(),
    stock: Math.max(0, Number(stock)),
    featured: !!featured
  };

  products.push(newProduct);
  writeData(PRODUCTS_FILE, products);

  res.status(201).json(newProduct);
});

// Update product (Admin)
app.put("/api/products/:id", requireAdmin, (req, res) => {
  const { name, description, price, category, imageUrl, stock, featured } = req.body;
  const products = readData<Product[]>(PRODUCTS_FILE);
  const index = products.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: "Product not found." });
    return;
  }

  const updatedProduct = {
    ...products[index],
    name: name !== undefined ? name.trim() : products[index].name,
    description: description !== undefined ? description.trim() : products[index].description,
    price: price !== undefined ? Number(price) : products[index].price,
    category: category !== undefined ? category.trim() : products[index].category,
    imageUrl: imageUrl !== undefined ? imageUrl.trim() : products[index].imageUrl,
    stock: stock !== undefined ? Math.max(0, Number(stock)) : products[index].stock,
    featured: featured !== undefined ? !!featured : products[index].featured
  };

  products[index] = updatedProduct;
  writeData(PRODUCTS_FILE, products);

  res.json(updatedProduct);
});

// Delete product (Admin)
app.delete("/api/products/:id", requireAdmin, (req, res) => {
  const products = readData<Product[]>(PRODUCTS_FILE);
  const filtered = products.filter(p => p.id !== req.params.id);

  if (filtered.length === products.length) {
    res.status(404).json({ error: "Product not found." });
    return;
  }

  writeData(PRODUCTS_FILE, filtered);
  res.json({ success: true, message: `Product ${req.params.id} deleted successfully.` });
});


// --- Order Endpoints ---

// Create Order (User Checkout)
app.post("/api/orders", requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress || !paymentMethod) {
    res.status(400).json({ error: "Order details (items, shippingAddress, paymentMethod) are incomplete." });
    return;
  }

  // Deduct/Verify stocks
  const products = readData<Product[]>(PRODUCTS_FILE);
  const finalItems = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      res.status(400).json({ error: `Product ID ${item.productId} was not found in our catalog.` });
      return;
    }
    if (product.stock < item.quantity) {
      res.status(400).json({ error: `Not enough stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` });
      return;
    }
    // Deduct stock
    product.stock -= item.quantity;
    finalItems.push({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: item.quantity,
      imageUrl: product.imageUrl
    });
  }

  // Save the updated product stock values
  writeData(PRODUCTS_FILE, products);

  const orders = readData<Order[]>(ORDERS_FILE);
  const newOrder: Order = {
    id: "ord_" + Math.random().toString(36).substr(2, 9),
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    items: finalItems,
    totalAmount: Number(totalAmount),
    shippingAddress,
    paymentMethod,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder); // Add to beginning of array
  writeData(ORDERS_FILE, orders);

  res.status(201).json(newOrder);
});

// List orders
// If user: gets their own orders
// If admin: gets ALL orders in the system
app.get("/api/orders", requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const orders = readData<Order[]>(ORDERS_FILE);

  if (user.role === "admin") {
    res.json(orders);
  } else {
    const userOrders = orders.filter(o => o.userId === user.id);
    res.json(userOrders);
  }
});

// Get single order details
app.get("/api/orders/:id", requireAuth, (req, res) => {
  const user = (req as any).user as User;
  const orders = readData<Order[]>(ORDERS_FILE);
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ error: "Order not found." });
    return;
  }

  // Safety check: only admin or the creator can view this order
  if (user.role !== "admin" && order.userId !== user.id) {
    res.status(403).json({ error: "Access denied. This order does not belong to you." });
    return;
  }

  res.json(order);
});

// Update Order Status (Admin only, e.g. shipping progress)
app.put("/api/orders/:id", requireAdmin, (req, res) => {
  const { status } = req.body;
  const allowedStatuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

  if (!status || !allowedStatuses.includes(status as OrderStatus)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}` });
    return;
  }

  const orders = readData<Order[]>(ORDERS_FILE);
  const index = orders.findIndex(o => o.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: "Order not found." });
    return;
  }

  // If order is cancelled, we return inventory stock to the store catalog as a friendly e-commerce feature
  const previousStatus = orders[index].status;
  if (status === "cancelled" && previousStatus !== "cancelled") {
    const products = readData<Product[]>(PRODUCTS_FILE);
    for (const item of orders[index].items) {
      const p = products.find(prod => prod.id === item.productId);
      if (p) {
        p.stock += item.quantity;
      }
    }
    writeData(PRODUCTS_FILE, products);
  }

  orders[index].status = status as OrderStatus;
  writeData(ORDERS_FILE, orders);

  res.json(orders[index]);
});

// ==========================================
// VITE AND STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For React/Vite router fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});

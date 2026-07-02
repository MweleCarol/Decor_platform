import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { initSocketServer } from "./modules/chat/chat.gateway.js";

// Routers
import { authRouter } from "./modules/auth/auth.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { productsRouter } from "./modules/products/products.routes.js";
import { categoriesRouter } from "./modules/categories/categories.routes.js";
import { cartRouter } from "./modules/cart/Cart.routes.js";
import { wishlistRouter } from "./modules/wishlist/wishlist.routes.js";
import { ordersRouter } from "./modules/orders/orders.routes.js";
import { reviewsRouter } from "./modules/reviews/reviews.routes.js";
import { chatRouter } from "./modules/chat/chat.routes.js";
import { designerRouter } from "./modules/ai-designer/designer.routes.js";
import { customizerRouter } from "./modules/ai-customizer/customizer.routes.js";
import { assistantRouter } from "./modules/ai-assistant/assistant.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { errorHandler } from "./shared/middleware/error-handler.js";

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/orders", ordersRouter);
app.use("/api", reviewsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/ai/designer", designerRouter);
app.use("/api/ai/customizer", customizerRouter);
app.use("/api/ai/assistant", assistantRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

initSocketServer(httpServer, env.CORS_ORIGIN);

httpServer.listen(env.PORT, () => {
  console.log(`
 
    Decor Platform API                 
    http://localhost:${env.PORT}              
    Socket.IO enabled                  
  
  `);
});
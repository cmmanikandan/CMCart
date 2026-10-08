import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import ws from 'ws';
import { createClient } from '@supabase/supabase-js';

const PORT = Number(process.env.PORT) || 5000;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xwqaysdjisvdndwqiwxk.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_HRQ9-cZLMTGg8enyCKvI9A_okPP_xYX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    transport: ws
  }
});

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const httpServer = createServer(app);

// WebSocket server setup
const wss = new WebSocketServer({ server: httpServer });

// Track client subscriptions: client -> Set of orderIds
const clients = new Map();

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  clients.set(ws, { subscribedOrders: new Set(), subscribeAll: true });
  console.log(`[WS] Client connected from ${clientIp}. Total active: ${wss.clients.size}`);

  // Send initial welcome & heartbeat
  ws.send(JSON.stringify({
    type: 'connected',
    status: 'online',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      const clientMeta = clients.get(ws) || { subscribedOrders: new Set(), subscribeAll: true };

      if (data.type === 'subscribe_order' && data.orderId) {
        clientMeta.subscribedOrders.add(String(data.orderId));
        console.log(`[WS] Client subscribed to order: ${data.orderId}`);
      } else if (data.type === 'unsubscribe_order' && data.orderId) {
        clientMeta.subscribedOrders.delete(String(data.orderId));
      } else if (data.type === 'subscribe_all') {
        clientMeta.subscribeAll = true;
      } else if (data.type === 'order_status_update') {
        // Broadcast incoming status update to all other connected peers
        broadcastOrderUpdate(data.orderId, data.status, data.order, ws);
      } else if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch (e) {
      console.warn('[WS] Parse message error:', e.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected. Total active: ${wss.clients.size}`);
  });

  ws.on('error', (err) => {
    console.warn('[WS] Client error:', err.message);
  });
});

// Periodic ping to keep alive
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  });
}, 30000);

/**
 * Broadcast order status update to connected WebSocket clients
 */
export function broadcastOrderUpdate(orderId, status, orderData = null, excludeWs = null) {
  const payload = JSON.stringify({
    type: 'order_status_updated',
    orderId: String(orderId),
    status,
    order: orderData,
    timestamp: new Date().toISOString()
  });

  let sentCount = 0;
  wss.clients.forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      const meta = clients.get(ws);
      if (meta && (meta.subscribeAll || meta.subscribedOrders.has(String(orderId)))) {
        ws.send(payload);
        sentCount++;
      }
    }
  });

  console.log(`[WS Broadcast] Order ${orderId} -> "${status}" dispatched to ${sentCount} clients.`);
}

// REST Endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CMCart Realtime WebSocket & Orders Backend',
    activeWsClients: wss.clients.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CMCart Realtime WebSocket & Orders Backend',
    activeWsClients: wss.clients.size,
    timestamp: new Date().toISOString()
  });
});

// Fetch all orders
app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, orders: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch single order
app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .or(`id.eq.${id},order_number.eq.${id}`)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, order: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update order status live & broadcast via WebSockets
app.patch('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, note, timeline } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: 'status is required' });
  }

  try {
    // 1. Fetch current order
    const { data: currentOrder, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${id},order_number.eq.${id}`)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    const stepOrder = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    let updatedTimeline = timeline || currentOrder?.timeline || [];

    if (!Array.isArray(updatedTimeline)) updatedTimeline = [];

    const currentIdx = stepOrder.indexOf(status);
    if (currentIdx !== -1) {
      updatedTimeline.forEach((step, idx) => {
        if (idx <= currentIdx) {
          step.completed = true;
          if (!step.time || step.time.includes('Pending')) {
            step.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }
      });
    }

    if (status === 'Cancelled') {
      updatedTimeline.push({
        status: 'Cancelled',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: true,
        note: note || 'Order was cancelled.'
      });
    }

    // 2. Update Supabase PostgreSQL
    const { data: updatedOrder, error: updateErr } = await supabase
      .from('orders')
      .update({
        status,
        timeline: updatedTimeline,
        updated_at: new Date().toISOString()
      })
      .or(`id.eq.${id},order_number.eq.${id}`)
      .select('*, order_items(*)')
      .maybeSingle();

    if (updateErr) throw updateErr;

    // 3. Broadcast to all active WebSocket clients immediately
    broadcastOrderUpdate(id, status, updatedOrder);

    res.json({
      success: true,
      order: updatedOrder,
      message: `Order status successfully updated to ${status} and broadcasted via WebSockets.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Broadcast any custom event
app.post('/api/orders/broadcast', (req, res) => {
  const { orderId, status, order } = req.body;
  if (!orderId || !status) {
    return res.status(400).json({ success: false, error: 'orderId and status required' });
  }

  broadcastOrderUpdate(orderId, status, order);
  res.json({ success: true, message: 'Broadcast emitted successfully' });
});

// Start listening
httpServer.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 CMCart Realtime WebSocket Server running on port ${PORT}`);
  console.log(`   - HTTP: http://localhost:${PORT}`);
  console.log(`   - WS:   ws://localhost:${PORT}`);
  console.log(`   - Health: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

// Also listen to Supabase Realtime in node server to bridge Postgres changes
try {
  supabase
    .channel('node-server-orders-bridge')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        console.log(`[Supabase DB Event] Order ${payload.new?.id || payload.old?.id}: ${payload.eventType}`);
        if (payload.new) {
          broadcastOrderUpdate(payload.new.id, payload.new.status, payload.new);
          if (payload.new.order_number) {
            broadcastOrderUpdate(payload.new.order_number, payload.new.status, payload.new);
          }
        }
      }
    )
    .subscribe();
} catch (e) {
  console.warn('[Supabase Bridge note]', e.message);
}

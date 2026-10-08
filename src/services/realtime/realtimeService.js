import { supabase } from '../supabase/supabaseInit';

const WS_PORT = 5000;
const getWsUrl = () => {
  if (typeof window === 'undefined') return `ws://localhost:${WS_PORT}`;
  const envUrl = import.meta.env.VITE_WS_URL;
  if (envUrl) return envUrl;
  return `ws://${window.location.hostname || 'localhost'}:${WS_PORT}`;
};

const getBackendHttpUrl = () => {
  if (typeof window === 'undefined') return `http://localhost:${WS_PORT}`;
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl) return envUrl;
  return `http://${window.location.hostname || 'localhost'}:${WS_PORT}`;
};

class RealtimeOrderManager {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.isConnecting = false;
    this.subscribers = new Set(); // { orderId, callback }
    this.allOrderSubscribers = new Set(); // callback
    this.supabaseChannel = null;
    this.isConnected = false;

    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.initWebSocket();
    this.initSupabaseRealtime();
    this.initWindowListener();
  }

  // 1. WebSocket Client Connection
  initWebSocket() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) return;
    this.isConnecting = true;

    try {
      const url = getWsUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.isConnecting = false;
        console.log('[Realtime WS] Connected to CMCart live server.');

        // Re-subscribe any tracked orders
        this.subscribers.forEach(({ orderId }) => {
          if (orderId) {
            this.sendWsMessage({ type: 'subscribe_order', orderId });
          }
        });
        this.sendWsMessage({ type: 'subscribe_all' });
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'order_status_updated') {
            this.handleOrderUpdate(payload.orderId, payload.status, payload.order);
          }
        } catch (e) {
          // ignore parsing error
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.isConnecting = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        this.isConnecting = false;
      };
    } catch (err) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.initWebSocket();
    }, 4000);
  }

  sendWsMessage(msg) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(msg));
      } catch (e) { /* ignore */ }
    }
  }

  // 2. Supabase Cloud Realtime Channel
  initSupabaseRealtime() {
    if (!supabase || this.supabaseChannel) return;

    try {
      this.supabaseChannel = supabase
        .channel('cmcart-live-orders-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            const row = payload.new || payload.old;
            if (row) {
              const id = row.id || row.order_number;
              this.handleOrderUpdate(id, row.status, row);
            }
          }
        )
        .on('broadcast', { event: 'order_status_updated' }, ({ payload }) => {
          if (payload) {
            this.handleOrderUpdate(payload.orderId, payload.status, payload.order);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Supabase Realtime] Subscribed to orders cloud stream.');
          }
        });
    } catch (e) {
      console.warn('[Supabase Realtime note]', e.message);
    }
  }

  // 3. Window Custom Event Listener for cross-component reactivity
  initWindowListener() {
    window.addEventListener('cmcart:order_status_update', (e) => {
      const { orderId, status, order } = e.detail || {};
      if (orderId && status) {
        this.notifySubscribers(orderId, status, order);
      }
    });
  }

  // Handle incoming order status change from any source
  handleOrderUpdate(orderId, status, fullOrder = null) {
    // 1. Update local cache
    this.updateLocalOrderStore(orderId, status, fullOrder);

    // 2. Dispatch custom event
    window.dispatchEvent(
      new CustomEvent('cmcart:order_status_update', {
        detail: { orderId, status, order: fullOrder }
      })
    );

    // 3. Notify subscribers
    this.notifySubscribers(orderId, status, fullOrder);
  }

  updateLocalOrderStore(orderId, status, fullOrder = null) {
    try {
      const key = 'cmcart_store_v1';
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const store = JSON.parse(raw);
      if (!Array.isArray(store.orders)) return;

      const idx = store.orders.findIndex(
        (o) => o.id === orderId || o.order_number === orderId
      );

      if (idx !== -1) {
        store.orders[idx].status = status;
        if (fullOrder?.timeline) {
          store.orders[idx].timeline = fullOrder.timeline;
        }
        if (fullOrder?.updated_at) {
          store.orders[idx].updated_at = fullOrder.updated_at;
        }
        localStorage.setItem(key, JSON.stringify(store));
      }
    } catch (e) { /* ignore */ }
  }

  notifySubscribers(orderId, status, order) {
    const sId = String(orderId);
    this.subscribers.forEach((sub) => {
      if (String(sub.orderId) === sId || (order?.order_number && String(sub.orderId) === String(order.order_number))) {
        try {
          sub.callback({ orderId, status, order });
        } catch (e) {
          console.warn('Subscriber callback error:', e);
        }
      }
    });

    this.allOrderSubscribers.forEach((cb) => {
      try {
        cb({ orderId, status, order });
      } catch (e) {
        console.warn('All-orders subscriber callback error:', e);
      }
    });
  }

  // Subscribe to a specific order
  subscribeToOrder(orderId, callback) {
    if (!orderId || typeof callback !== 'function') return () => {};
    const sub = { orderId: String(orderId), callback };
    this.subscribers.add(sub);

    // Inform WebSocket server
    this.sendWsMessage({ type: 'subscribe_order', orderId });

    return () => {
      this.subscribers.delete(sub);
      this.sendWsMessage({ type: 'unsubscribe_order', orderId });
    };
  }

  // Subscribe to all order updates (e.g., admin orders page or orders list)
  subscribeToAllOrders(callback) {
    if (typeof callback !== 'function') return () => {};
    this.allOrderSubscribers.add(callback);
    return () => {
      this.allOrderSubscribers.delete(callback);
    };
  }

  // Broadcast order status change to WS, Supabase Channel, and Backend
  async broadcastStatusChange(orderId, newStatus, fullOrder = null) {
    // 1. Dispatch locally
    this.handleOrderUpdate(orderId, newStatus, fullOrder);

    // 2. Dispatch to WebSocket
    this.sendWsMessage({
      type: 'order_status_update',
      orderId,
      status: newStatus,
      order: fullOrder
    });

    // 3. Dispatch to Supabase broadcast channel
    if (this.supabaseChannel) {
      try {
        await this.supabaseChannel.send({
          type: 'broadcast',
          event: 'order_status_updated',
          payload: { orderId, status: newStatus, order: fullOrder }
        });
      } catch (e) { /* ignore */ }
    }

    // 4. Also call backend REST API asynchronously if running
    try {
      fetch(`${getBackendHttpUrl()}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          timeline: fullOrder?.timeline
        })
      }).catch(() => {});
    } catch (e) { /* ignore */ }
  }
}

export const realtimeOrders = new RealtimeOrderManager();
export default realtimeOrders;

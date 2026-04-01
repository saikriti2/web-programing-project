import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [queryType, setQueryType] = useState('');
  const [feedback, setFeedback] = useState('');
  const [view, setView] = useState('orders'); // orders, raise, place, feedback
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const queryOptions = [
    'Shipping Delay', 'Damaged Product', 'Missing Items', 'Wrong Item Received', 
    'Payment Failure', 'Double Charge', 'Refund Status', 'Technical Glitch', 
    'Account Access', 'Warranty Claim', 'Product Not as Described', 
    'Product Recommendation', 'Order Cancellation', 'Change Delivery Address', 
    'General Feedback'
  ];

  useEffect(() => {
    if (!token) navigate('/login');
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders', {
        headers: { 'x-auth-token': token }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      await axios.post('http://localhost:5000/api/orders', { orderId }, {
        headers: { 'x-auth-token': token }
      });
      fetchOrders();
      setView('orders');
    } catch (err) {
      alert('Order failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseComplaint = async () => {
    if (!selectedOrderId || !queryType) return alert('Select Order and Query Type');
    try {
      await axios.put(`http://localhost:5000/api/orders/${selectedOrderId}/complaint`, { query: queryType }, {
        headers: { 'x-auth-token': token }
      });
      fetchOrders();
      setView('orders');
      setSelectedOrderId('');
      setQueryType('');
    } catch (err) {
      alert('Failed to raise complaint');
    }
  };

  const handleFeedback = async () => {
    if (!selectedOrderId || !feedback) return alert('Select Order and provide feedback');
    try {
      await axios.put(`http://localhost:5000/api/orders/${selectedOrderId}/resolve`, { feedback }, {
        headers: { 'x-auth-token': token }
      });
      fetchOrders();
      setView('orders');
      setSelectedOrderId('');
      setFeedback('');
    } catch (err) {
      alert('Failed to submit feedback');
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Welcome, {user?.username}</h3>
        <button className={`sidebar-btn ${view === 'orders' ? 'active' : ''}`} onClick={() => setView('orders')}>📦 My Orders</button>
        <button className={`sidebar-btn ${view === 'place' ? 'active' : ''}`} onClick={() => setView('place')}>➕ Place New Order</button>
        <button className={`sidebar-btn ${view === 'raise' ? 'active' : ''}`} onClick={() => setView('raise')}>❗ Raise Query</button>
        <button className={`sidebar-btn ${view === 'feedback' ? 'active' : ''}`} onClick={() => setView('feedback')}>💬 Give Feedback</button>
        <div style={{ flex: 1 }}></div>
        <button className="sidebar-btn" onClick={logout} style={{ color: 'var(--error)' }}>🚪 Logout</button>
      </aside>

      <main className="main-content">
        {view === 'orders' && (
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Order Dashboard</h2>
            {orders.length === 0 ? <p>No orders yet.</p> : (
              orders.map(order => (
                <div key={order._id} className={`order-card ${order.status}`}>
                  <div>
                    <h4 style={{ color: 'var(--white)' }}>{order.orderId}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                    {order.query && <p style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>Issue: {order.query}</p>}
                    {order.feedback && <p style={{ fontSize: '0.85rem', color: 'var(--success)' }}>Feedback: {order.feedback}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                    <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                      {order.status === 'placed' && 'Processing...'}
                      {order.status === 'complaint' && 'Under Review'}
                      {order.status === 'resolved' && 'Completed'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'place' && (
          <div className="auth-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>New Purchase</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Experience our premium checkout flow.</p>
            <button className="btn-primary" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Order & Place'}
            </button>
          </div>
        )}

        {view === 'raise' && (
          <div className="auth-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Identify Problem</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Select an order and describe your issue.</p>
            
            <div className="form-group">
              <label>Select Order ID</label>
              <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}>
                <option value="">-- Select Order --</option>
                {orders.filter(o => o.status === 'placed').map(o => (
                  <option key={o._id} value={o._id}>{o.orderId}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Problem Type (15 Options)</label>
              <select value={queryType} onChange={(e) => setQueryType(e.target.value)}>
                <option value="">-- Select Issue --</option>
                {queryOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <button className="btn-primary" onClick={handleRaiseComplaint}>Submit Complaint</button>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--error)' }}>
              Note: Status will turn RED upon submission.
            </p>
          </div>
        )}

        {view === 'feedback' && (
          <div className="auth-box" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Resolve & Feedback</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Help us improve by providing feedback on resolved issues.</p>
            
            <div className="form-group">
              <label>Select Order (In Complaint Status)</label>
              <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}>
                <option value="">-- Select Order --</option>
                {orders.filter(o => o.status === 'complaint').map(o => (
                  <option key={o._id} value={o._id}>{o.orderId}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Your Feedback</label>
              <textarea rows="4" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Tell us about the resolution..."></textarea>
            </div>

            <button className="btn-primary" onClick={handleFeedback}>Resolve Issue</button>
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--white)' }}>
              Note: Status will turn WHITE upon submission.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

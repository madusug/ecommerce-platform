import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('Loading...');
  const [products, setProducts] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');

  // Fetch initial message
  useEffect(() => {
    axios.get('http://localhost:3000/api/message')
      .then(response => setMessage(response.data.message))
      .catch(error => {
        console.error('Error fetching message:', error);
        setMessage('Failed to connect to backend');
      });

    // Fetch products
    axios.get('http://localhost:3000/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  // Handle login
  const handleLogin = () => {
    axios.post('http://localhost:3000/api/login', { username, password })
      .then(response => {
        if (response.data.success) {
          setIsLoggedIn(true);
          setUsername('');
          setPassword('');
        } else {
          alert('Login failed: ' + response.data.message);
        }
      })
      .catch(error => console.error('Login error:', error));
  };

  // Handle order
  const handleOrder = () => {
    const productIds = products.map(p => p.id); // Mock: order all products
    axios.post('http://localhost:3000/api/orders', { userId: 1, productIds })
      .then(response => {
        if (response.data.success) {
          setOrderStatus(`Order placed! ID: ${response.data.orderId}`);
        }
      })
      .catch(error => console.error('Order error:', error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Webapp</h1>
        <p>Backend says: {message}</p>

        {!isLoggedIn ? (
          <div>
            <h2>Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
          </div>
        ) : (
          <div>
            <h2>Welcome, User!</h2>
            <h3>Products</h3>
            <ul>
              {products.map(product => (
                <li key={product.id}>
                  {product.name} - ${product.price}
                </li>
              ))}
            </ul>
            <button onClick={handleOrder}>Place Order</button>
            {orderStatus && <p>{orderStatus}</p>}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
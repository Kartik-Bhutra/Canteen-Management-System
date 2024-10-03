import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import styles from '../CSS/showOrder.module.css';
import { useNavigate, useLocation } from 'react-router-dom';

const ShowOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io('http://localhost:5000', { withCredentials: true });
    axios.get('http://localhost:5000/user', { withCredentials: true })
      .then(res => {
        const getEmail = res.data.email;
        if (getEmail === "") return navigate('/login');
        setEmail(getEmail);
        socket.emit("order_room", getEmail);
        axios.post('http://localhost:5000/showorder', {
          email: getEmail
        })
          .then(res => {
            setOrders(res.data);
            setLoading(false);
          })
          .catch(err => {
            console.log(err);
            setLoading(false);
          });
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });

    socket.on("status_change", (data) => {
      console.log(`Order status updated for order ${data.orderId}: ${data.status}`);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === data.orderId ? { ...order, order_status: data.status } : order
        )
      );
    });

    socket.on("new_order", (data) => {
      axios.post('http://localhost:5000/showorder', {
        email
      })
        .then(res => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });
    })

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  const handleStatusChange = (orderId, newStatus, user_email) => {
    axios.post('http://localhost:5000/status', {
      id: orderId,
      status: newStatus,
      email: user_email
    })
      .then(res => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.order_id === orderId ? { ...order, order_status: newStatus } : order
          )
        );
        setLoading(false);
      })
      .catch(err => console.error('Error updating status:', err));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.ordersContainer}>
      <h2>Recent orders</h2>
      {orders.length === 0 ? (
        <p>No orders found, Check on pastOrders</p>
      ) : (
        <table className={styles.ordersTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              {email === "admin@iitgoa.ac.in" && <th>Email</th>}
              <th>Items</th>
              <th>Total Price</th>
              <th>Order Time</th>
              <th>Status</th>
              {email === "admin@iitgoa.ac.in" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              order.order_status !== "Delivered" && order.order_status !== "Cancelled" &&
              <tr key={order.order_id}>
                <td>{order.order_id}</td>
                {email === "admin@iitgoa.ac.in" && <td>{order.user_email}</td>}
                <td>{order.ordered_items}</td>
                <td>₹{order.order_price}</td>
                <td>{new Date(order.order_time).toLocaleString()}</td>
                <td>{order.order_status}</td>
                {email === "admin@iitgoa.ac.in" && (
                  <td>
                    <select
                      value={order.order_status}
                      onChange={(e) => handleStatusChange(order.order_id, e.target.value, order.user_email)}
                      className={styles.statusDropdown}
                    >
                      {order.order_status === "notAccepted" &&
                        <option value="SELECT" className="option">SELECT</option>
                      }
                      {order.order_status === "inProgress" &&
                        <option value="SELECT" className="option">SELECT</option>
                      }
                      {order.order_status === "Completed" &&
                        <option value="SELECT" className="option">SELECT</option>
                      }
                      {order.order_status === "notAccepted" &&
                        <option value="inProgress" className="option">inProgress</option>
                      }
                      {order.order_status === "notAccepted" &&
                        <option value="Cancelled" className="option">Cancelled</option>
                      }
                      {order.order_status === "inProgress" &&
                        <option value="Completed" className="option">Completed</option>
                      }
                      {order.order_status === "Completed" &&
                        <option value="Delivered" className="option">Delivered</option>
                      }
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ShowOrder;

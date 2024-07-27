import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { database } from './firebase';
import { ref, onValue, set } from 'firebase/database';
import './dark-theme.css'; // Import the dark theme CSS

const DraggableItemsPage = ({ currentUser }) => {
  const [order, setOrder] = useState(null);
  const [lock, setLock] = useState(false);

  const orderPath = `orders/${currentUser.uuid}`;

  useEffect(() => {
    const orderRef = ref(database, orderPath);

    onValue(orderRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Order data:', data); // Debugging line
      if (data) {
        const updatedUsers = data.users || [];
        const updatedItems = (data.items || []).map(item => ({
          ...item,
          assignedTo: item.assignedTo || 'Unassigned',
        }));

        setOrder({
          ...data,
          users: updatedUsers,
          items: updatedItems,
        });
      }
    }, (error) => {
      console.error('Firebase error:', error); // Log any errors
    });
  }, [orderPath]);

  useEffect(() => {
    if (order) {
      const existingUser = order.users.includes(currentUser.name);
      if (!existingUser) {
        const updatedUsers = [...order.users, currentUser.name].filter(user => user); // Remove any falsy values
        setOrder((prevOrder) => ({ ...prevOrder, users: updatedUsers }));
        set(ref(database, `${orderPath}/users`), updatedUsers)
          .catch((error) => {
            console.error('Error updating users:', error); // Log any errors
          });
      }
    }
  }, [currentUser, order, orderPath]);

  const onDragEnd = (result) => {
    if (lock || !order) return;

    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const updatedItems = order.items.map(item => {
      if (item.id === draggableId) {
        return { ...item, assignedTo: destination.droppableId };
      }
      return item;
    });

    setOrder((prevOrder) => ({ ...prevOrder, items: updatedItems }));
    set(ref(database, `${orderPath}/items`), updatedItems)
      .catch((error) => {
        console.error('Error updating items:', error); // Log any errors
      });
  };

  const calculateTotalPrice = (userName) => {
    if (!order) return 0;
    return order.items
      .filter(item => item.assignedTo === userName)
      .reduce((total, item) => total + item.total_price, 0);
  };

  if (!order) {
    return <div>Loading...</div>;
  }

  const sortedUsers = [...(order.users || []).filter(user => user !== 'Unassigned'), 'Unassigned'];

  return (
    <div className="draggable-container">
      <h1 className="draggable-header">Welcome, {currentUser.name}!</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          {sortedUsers.map((user) => (
            <div key={user} className="draggable-user-card">
              <h2 className="draggable-user-header">{user}</h2>
              <Droppable droppableId={user}>
                {(provided, snapshot) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="draggable-list"
                    style={{ background: snapshot.isDraggingOver ? '#3a3a3a' : '#2a2a2a' }}
                  >
                    {order.items
                      .filter((item) => item.assignedTo === user)
                      .map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={lock}>
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`draggable-item ${snapshot.isDragging ? 'draggable-item-dragging' : ''}`}
                            >
                              <div><strong>Name:</strong> {item.name}</div>
                              <div><strong>Quantity:</strong> {item.quantity}</div>
                              <div><strong>Total Price:</strong> {item.total_price}</div>
                              <div><strong>Unit Price:</strong> {item.unit_price}</div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                    <li className="total-price">
                      Total Price: {calculateTotalPrice(user)}
                    </li>
                  </ul>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      <div className="lock-container">
        <label className="lock-switch">
          <span className="lock-switch-label">Lock Items</span>
          <div className={`lock-switch-container ${lock ? 'locked' : ''}`}>
            <div className={`lock-switch-button ${lock ? 'locked' : ''}`}></div>
          </div>
          <input 
            type="checkbox" 
            checked={lock}
            onChange={(e) => setLock(e.target.checked)}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
};

export default DraggableItemsPage;

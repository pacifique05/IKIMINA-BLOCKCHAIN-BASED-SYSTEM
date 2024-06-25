import React, { useState, useEffect } from 'react';
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
import { example_backend } from 'declarations/example_backend';
import './index.scss';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [showUpdateCustomerForm, setShowUpdateCustomerForm] = useState(false);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ firstName: '', lastName: '', dob: '', saving: '', date: '' });
  const [currentCustomer, setCurrentCustomer] = useState(null);
  
  const authClientPromise = AuthClient.create();

  const signIn = async () => {
    const authClient = await authClientPromise;
    const internetIdentityUrl = process.env.NODE_ENV === 'production'
      ? undefined
      : `http://localhost:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;

    await new Promise((resolve) => {
      authClient.login({
        identityProvider: internetIdentityUrl,
        onSuccess: () => resolve(undefined),
      });
    });

    const identity = authClient.getIdentity();
    updateIdentity(identity);
    setIsLoggedIn(true);
  };

  const signOut = async () => {
    const authClient = await authClientPromise;
    await authClient.logout();
    updateIdentity(null);
  };

  const updateIdentity = (identity) => {
    if (identity) {
      setPrincipal(identity.getPrincipal());
      const agent = new HttpAgent();
      const actor = Actor.createActor(example_backend, { agent: agent });
      example_backend.setActor(actor);
    } else {
      setPrincipal(null);
      example_backend.setActor(null);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      const authClient = await authClientPromise;
      const isAuthenticated = await authClient.isAuthenticated();
      setIsLoggedIn(isAuthenticated);
      if (isAuthenticated) {
        const identity = authClient.getIdentity();
        updateIdentity(identity);
      }
    };

    checkLoginStatus();
  }, []);

  const fetchCustomers = async () => {
    try {
      const customersList = await example_backend.getCustomers();
      console.log("Fetched customers:", customersList);
      setCustomers(customersList);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  const handleAddCustomer = async (event) => {
    event.preventDefault();
    console.log("Submitting customer:", newCustomer);

    try {
      await example_backend.addCustomer(newCustomer.firstName, newCustomer.lastName, newCustomer.dob, newCustomer.saving, newCustomer.date);
      console.log("Customer added successfully");
      setNewCustomer({ firstName: '', lastName: '', dob: '', saving: '', date: '' });
      setShowAddCustomerForm(false);
      fetchCustomers();
    } catch (error) {
      console.error("Failed to add customer:", error);
    }
  };

  const handleUpdateCustomer = async (event) => {
    event.preventDefault();
    const confirmUpdate = window.confirm("Are you sure you want to update Member contribution?");
    if (confirmUpdate) {
      console.log("Updating customer:", currentCustomer);
  
      try {
        await example_backend.updateCustomer(currentCustomer.id, currentCustomer.firstName, currentCustomer.lastName, currentCustomer.dob, currentCustomer.saving, currentCustomer.date);
        console.log("Customer updated successfully");
        setCurrentCustomer(null);
        setShowUpdateCustomerForm(false);
        fetchCustomers();
      } catch (error) {
        console.error("Failed to update customer:", error);
      }
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete Member contribution on this list?");
    if (confirmDelete) {
      try {
        await example_backend.deleteCustomer(customerId);
        console.log("Customer deleted successfully");
        fetchCustomers();
      } catch (error) {
        console.error("Failed to delete customer:", error);
      }
    }
  };

  const handleViewCustomers = () => {
    if (customers.length === 0) {
      fetchCustomers();
    }
    setShowAddCustomerForm(false);
    setShowUpdateCustomerForm(false);
    setShowCustomerDetail(false);
  };

  const handleEditCustomer = (customer) => {
    setCurrentCustomer(customer);
    setShowUpdateCustomerForm(true);
    setShowAddCustomerForm(false);
    setShowCustomerDetail(false);
  };

  const handleViewCustomerDetail = (customer) => {
    setCurrentCustomer(customer);
    setShowCustomerDetail(true);
    setShowAddCustomerForm(false);
    setShowUpdateCustomerForm(false);
  };

  return (
    <main>
      <h1>IKIMINA SYSTEM</h1>
      {isLoggedIn ? (
        <>
          
          <button onClick={signOut}>Sign Out</button>
          <button onClick={() => setShowAddCustomerForm(true)}>Add New MEMBER</button>
          <button onClick={handleViewCustomers}>View MEMBERS</button>
          <h2>MEMBERS</h2>
          {!showAddCustomerForm && !showCustomerDetail && (
            <ul>
              {customers.map((customer, index) => (
                <li key={index}>
                  {customer.firstName} {customer.lastName} - {customer.dob} - {customer.saving} - {customer.date}
                  <div className="customer-actions">
                    <button onClick={() => handleEditCustomer(customer)}>Edit</button>
                    <button onClick={() => handleDeleteCustomer(customer.id)}>Delete</button>
                    <button onClick={() => handleViewCustomerDetail(customer)}>View</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {showAddCustomerForm && (
            <form onSubmit={handleAddCustomer}>
              <label>
                First Name:
                <input
                  type="text"
                  value={newCustomer.firstName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                  required
                />
              </label>
              <label>
                Last Name:
                <input
                  type="text"
                  value={newCustomer.lastName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                  required
                />
              </label>
              <label>
                DOB:
                <input
                  type="date"
                  value={newCustomer.dob}
                  onChange={(e) => setNewCustomer({ ...newCustomer, dob: e.target.value })}
                  required
                />
              </label>
              <label>
                SAVING:
                <input
                  type="text"
                  value={newCustomer.saving}
                  onChange={(e) => setNewCustomer({ ...newCustomer, saving: e.target.value })}
                  required
                />
              </label>
              <label>
                DATE:
                <input
                  type="date"
                  value={newCustomer.date}
                  onChange={(e) => setNewCustomer({ ...newCustomer, date: e.target.value })}
                  required
                />
              </label>
              <button type="submit">SAVE MEMBER CONTRIBUTION</button>
            </form>
          )}
          {showUpdateCustomerForm && currentCustomer && (
            <form onSubmit={handleUpdateCustomer}>
              <label>
                First Name:
                <input
                  type="text"
                  value={currentCustomer.firstName}
                  onChange={(e) => setCurrentCustomer({ ...currentCustomer, firstName: e.target.value })}
                  required
                />
              </label>
              <label>
                Last Name:
                <input
                  type="text"
                  value={currentCustomer.lastName}
                  onChange={(e) => setCurrentCustomer({ ...currentCustomer, lastName: e.target.value })}
                  required
                />
              </label>
              <label>
                DOB:
                <input
                  type="date"
                  value={currentCustomer.dob}
                  onChange={(e) => setCurrentCustomer({ ...currentCustomer, dob: e.target.value })}
                  required
                />
              </label>
              <label>
                SAVING:
                <input
                  type="text"
                  value={currentCustomer.saving}
                  onChange={(e) => setCurrentCustomer({ ...currentCustomer, saving: e.target.value })}
                  required
                />
              </label>
              <label>
                DATE:
                <input
                  type="date"
                  value={currentCustomer.date}
                  onChange={(e) => setCurrentCustomer({ ...currentCustomer, date: e.target.value })}
                  required
                />
              </label>
              <button type="submit">Update Member Contribution</button>
            </form>
          )}
          {showCustomerDetail && currentCustomer && (
            <div>
              <h2>Customer Details</h2>
              <p><strong>First Name:</strong> {currentCustomer.firstName}</p>
              <p><strong>Last Name:</strong> {currentCustomer.lastName}</p>
              <p><strong>Date of Birth:</strong> {currentCustomer.dob}</p>
              <p><strong>Saving:</strong> {currentCustomer.saving}</p>
              <p><strong>Date:</strong> {currentCustomer.date}</p>
              <button onClick={() => setShowCustomerDetail(false)}>Close</button>
            </div>
          )}
        </>
      ) : (
        <button onClick={signIn}>Sign In</button>
      )}
    </main>
  );
}

export default App;

import Array "mo:base/Array";

actor {

  // Define the Customer type
  public type Customer = {
    id : Nat;
    firstName : Text;
    lastName : Text;
    dob : Text;
    saving : Text;
    date : Text;
  };

  // State variables
  stable var customers : [Customer] = [];
  var nextId : Nat = 0;

  // Query function to fetch all customers
  public query func getCustomers() : async [Customer] {
    return customers;
  };

  // Function to add a new customer
  public func addCustomer(firstName : Text, lastName : Text, dob : Text, saving : Text, date : Text) : async () {
    let newCustomer : Customer = {
      id = nextId;
      firstName = firstName;
      lastName = lastName;
      dob = dob;
      saving = saving;
      date = date;
    };
    customers := Array.append<Customer>(customers, [newCustomer]);
    nextId := nextId + 1;
  };

  // Function to delete a customer by id
  public func deleteCustomer(id : Nat) : async () {
    customers := Array.filter<Customer>(customers, func(customer : Customer) : Bool {
      customer.id != id
    });
  };

  // Function to update a customer by id
  public func updateCustomer(id : Nat, firstName : Text, lastName : Text, dob : Text, saving : Text, date : Text) : async () {
    customers := Array.map<Customer, Customer>(customers, func(customer : Customer) : Customer {
      if (customer.id == id) {
        return {
          id = customer.id;
          firstName = firstName;
          lastName = lastName;
          dob = dob;
          saving = saving;
          date = date;
        };
      } else {
        return customer;
      }
    });
  };

};

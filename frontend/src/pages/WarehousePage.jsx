import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import Layout from "../component/Layout";
import ApiService from "../service/ApiService";
import "../styles/WarehousePage.css";

const WarehousePage = () => {

  const [warehouseList, setWarehouseList] =
    useState([]);

  const [users, setUsers] = useState([]);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] =
    useState("");

  const [city, setCity] = useState("");

  const [managerName, setManagerName] =
    useState("");

  const [
    contactNumber,
    setContactNumber,
  ] = useState("");

  const [locations, setLocations] =
    useState("");

  const [active, setActive] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const isAdmin =
    ApiService.isAdmin();

  const showMessage = (msg) => {

    setMessage(msg);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const showError = (msg) => {

    setError(msg);

    setTimeout(() => {
      setError("");
    }, 3000);
  };

  const fetchWarehouses =
    useCallback(async () => {

      try {

        const response =
          await ApiService.getAllWarehouses();

        setWarehouseList(
          response || []
        );

      } catch (error) {

        console.log(error);

        showError(
          "Failed to load warehouses"
        );
      }
    }, []);

  const fetchUsers =
    useCallback(async () => {

      try {

        const response =
          await ApiService.getAllUsers();

        setUsers(
          response.users || []
        );

      } catch (error) {

        console.log(error);

        showError(
          "Failed to load users"
        );
      }
    }, []);

  useEffect(() => {

    const loadData = async () => {

      await fetchWarehouses();

      if (isAdmin) {
        await fetchUsers();
      }
    };

    loadData();

  }, [
    isAdmin,
    fetchWarehouses,
    fetchUsers,
  ]);

  const managers = users.filter(
    (user) =>
      user.role &&
      user.role.toUpperCase() ===
        "MANAGER"
  );

  const clearFields = () => {

    setName("");
    setCode("");
    setAddress("");
    setCity("");
    setManagerName("");
    setContactNumber("");
    setLocations("");
    setActive(true);
  };

  const handleCreateWarehouse =
    async (e) => {

      e.preventDefault();

      if (
        !name ||
        !code ||
        !address ||
        !city ||
        !managerName ||
        !contactNumber ||
        !locations
      ) {

        showError(
          "Please fill all fields"
        );

        return;
      }

      try {

        const warehouseData = {
          warehouseName: name,
          warehouseCode: code,
          address,
          city,
          managerName,
          contactNumber,
          locations,
          active,
        };

        await ApiService.addWarehouse(
          warehouseData
        );

        showMessage(
          "Warehouse created successfully"
        );

        clearFields();

        fetchWarehouses();

      } catch (error) {

        console.log(error);

        showError(
          error.response?.data?.message ||
            "Failed to create warehouse"
        );
      }
    };

  const handleDeleteWarehouse =
    async (warehouseId) => {

      const confirmDelete =
        window.confirm(
          "Delete this warehouse?"
        );

      if (!confirmDelete) return;

      try {

        await ApiService.deleteWarehouse(
          warehouseId
        );

        showMessage(
          "Warehouse deleted successfully"
        );

        fetchWarehouses();

      } catch (error) {

        console.log(error);

        showError(
          "Failed to delete warehouse"
        );
      }
    };

  const handleToggleStatus =
    async (warehouse) => {

      try {

        const updatedWarehouse = {
          ...warehouse,
          active: !warehouse.active,
        };

        await ApiService.updateWarehouse(
          warehouse.id,
          updatedWarehouse
        );

        showMessage(
          "Warehouse status updated"
        );

        fetchWarehouses();

      } catch (error) {

        console.log(error);

        showError(
          "Failed to update status"
        );
      }
    };

  return (

    <Layout>

      <div className="warehouse-page">

        <h1 className="warehouse-title">
          Warehouse Management
        </h1>

        {message && (
          <div className="warehouse-success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="warehouse-error-message">
            {error}
          </div>
        )}

        {isAdmin && (

          <div className="warehouse-form-card">

            <h2 className="warehouse-form-title">
              Create Warehouse
            </h2>

            <form
              className="warehouse-form"
              onSubmit={
                handleCreateWarehouse
              }
            >

              <div className="warehouse-grid">

                <input
                  type="text"
                  placeholder="Warehouse Name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                />

                <input
                  type="text"
                  placeholder="Warehouse Code"
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value
                    )
                  }
                />

                <input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) =>
                    setAddress(
                      e.target.value
                    )
                  }
                />

                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) =>
                    setCity(
                      e.target.value
                    )
                  }
                />

                <input
                  type="text"
                  placeholder="Contact Number"
                  value={contactNumber}
                  onChange={(e) =>
                    setContactNumber(
                      e.target.value
                    )
                  }
                />

                <input
                  type="text"
                  placeholder="Locations"
                  value={locations}
                  onChange={(e) =>
                    setLocations(
                      e.target.value
                    )
                  }
                />

                <select
                  className="warehouse-select"
                  value={managerName}
                  onChange={(e) =>
                    setManagerName(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select Manager
                  </option>

                  {managers.map(
                    (manager) => (
                      <option
                        key={manager.id}
                        value={
                          manager.name
                        }
                      >
                        {manager.name}
                      </option>
                    )
                  )}

                </select>

                <select
                  className="warehouse-select"
                  value={active}
                  onChange={(e) =>
                    setActive(
                      e.target.value ===
                        "true"
                    )
                  }
                >

                  <option value={true}>
                    Active
                  </option>

                  <option value={false}>
                    Inactive
                  </option>

                </select>

              </div>

              <button
                type="submit"
                className="warehouse-create-btn"
              >
                Create Warehouse
              </button>

            </form>

          </div>
        )}

        <div className="warehouse-table-card">

          <table className="warehouse-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Code</th>
                <th>City</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Locations</th>

                {isAdmin && (
                  <th>Actions</th>
                )}

              </tr>

            </thead>

            <tbody>

              {warehouseList.map(
                (warehouse) => (

                  <tr
                    key={warehouse.id}
                  >

                    <td>{warehouse.id}</td>

                    <td>
                      {
                        warehouse.warehouseName
                      }
                    </td>

                    <td>
                      {
                        warehouse.warehouseCode
                      }
                    </td>

                    <td>
                      {warehouse.city}
                    </td>

                    <td>
                      {
                        warehouse.managerName
                      }
                    </td>

                    <td>

                      {isAdmin ? (

                        <button
                          className={
                            warehouse.active
                              ? "status-active"
                              : "status-inactive"
                          }
                          onClick={() =>
                            handleToggleStatus(
                              warehouse
                            )
                          }
                        >
                          {
                            warehouse.active
                              ? "Active"
                              : "Inactive"
                          }
                        </button>

                      ) : (

                        <span
                          className={
                            warehouse.active
                              ? "status-active"
                              : "status-inactive"
                          }
                        >
                          {
                            warehouse.active
                              ? "Active"
                              : "Inactive"
                          }
                        </span>

                      )}

                    </td>

                    <td>

                      <span className="location-badge">
                        {
                          warehouse.locations
                        }
                      </span>

                    </td>

                    {isAdmin && (

                      <td>

                        <button
                          className="warehouse-delete-btn"
                          onClick={() =>
                            handleDeleteWarehouse(
                              warehouse.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </td>
                    )}

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </Layout>
  );
};

export default WarehousePage;
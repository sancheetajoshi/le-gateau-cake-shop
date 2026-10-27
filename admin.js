/* =========================================================
   LE GATEAU ADMIN DASHBOARD
   MYSQL + NODE.JS + EXPRESS VERSION
========================================================= */


/* =========================================================
   DASHBOARD
========================================================= */

async function loadAdminDashboard() {

    try {

        /* ================================================
           LOAD CUSTOMERS
        ================================================= */

        const customerResponse =
            await fetch("/api/admin/customers");


        const customerData =
            await customerResponse.json();


        /* ================================================
           LOAD ORDERS
        ================================================= */

        const orderResponse =
            await fetch("/api/admin/orders");


        const orderData =
            await orderResponse.json();


        /* ================================================
           CHECK CUSTOMER RESPONSE
        ================================================= */

        if (!customerData.success) {

            console.error(
                "Customer loading error:",
                customerData.message
            );

            alert(
                "Unable to load customers."
            );

            return;

        }


        /* ================================================
           CHECK ORDER RESPONSE
        ================================================= */

        if (!orderData.success) {

            console.error(
                "Order loading error:",
                orderData.message
            );

            alert(
                "Unable to load orders."
            );

            return;

        }


        const customers =
            customerData.customers || [];


        const orders =
            orderData.orders || [];


        /* ================================================
           CUSTOMER COUNT
        ================================================= */

        const customerCount =
            document.getElementById(
                "customerCount"
            );


        if (customerCount) {

            customerCount.textContent =
                customers.length;

        }


        /* ================================================
           ORDER COUNT
        ================================================= */

        const orderCount =
            document.getElementById(
                "orderCount"
            );


        if (orderCount) {

            orderCount.textContent =
                orders.length;

        }


        /* ================================================
           ACTIVE ORDERS
        ================================================= */

        const activeOrders =
            orders.filter(function(order) {

                return (
                    order.status !== "Delivered" &&
                    order.status !== "Cancelled"
                );

            });


        const activeOrderCount =
            document.getElementById(
                "activeOrderCount"
            );


        if (activeOrderCount) {

            activeOrderCount.textContent =
                activeOrders.length;

        }


        /* ================================================
           DELIVERED ORDERS
        ================================================= */

        const deliveredOrders =
            orders.filter(function(order) {

                return (
                    order.status === "Delivered"
                );

            });


        const deliveredCount =
            document.getElementById(
                "deliveredCount"
            );


        if (deliveredCount) {

            deliveredCount.textContent =
                deliveredOrders.length;

        }


        /* ================================================
           DISPLAY CUSTOMERS
        ================================================= */

        renderCustomers(
            customers
        );


        /* ================================================
           DISPLAY ORDERS
        ================================================= */

        renderOrders(
            orders
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        alert(
            "Unable to connect to the server."
        );

    }

}


/* =========================================================
   CUSTOMER FORM
========================================================= */

function showCustomerForm() {

    const container =
        document.getElementById(
            "customerFormContainer"
        );


    const title =
        document.getElementById(
            "customerFormTitle"
        );


    const form =
        document.getElementById(
            "customerForm"
        );


    const customerId =
        document.getElementById(
            "customerId"
        );


    if (container) {

        container.style.display =
            "block";

    }


    if (title) {

        title.textContent =
            "Add Customer";

    }


    if (form) {

        form.reset();

    }


    if (customerId) {

        customerId.value =
            "";

    }

}


function hideCustomerForm() {

    const container =
        document.getElementById(
            "customerFormContainer"
        );


    if (container) {

        container.style.display =
            "none";

    }

}


/* =========================================================
   CUSTOMER FORM
========================================================= */

const customerForm =
    document.getElementById(
        "customerForm"
    );


if (customerForm) {

    customerForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            /*
               Customer registration is handled
               through register.html.

               There is currently no admin
               POST /api/customers endpoint.
            */

            alert(
                "Please use the Register page to add customers."
            );

        }
    );

}


/* =========================================================
   DISPLAY CUSTOMERS
========================================================= */

function renderCustomers(customers) {

    const container =
        document.getElementById(
            "customersTable"
        );


    if (!container) {

        return;

    }


    if (
        !customers ||
        customers.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-admin">

                No customers found.

            </div>

        `;

        return;

    }


    let html = `

        <table>

            <thead>

                <tr>

                    <th>ID</th>

                    <th>Name</th>

                    <th>Phone</th>

                    <th>Email</th>

                    <th>Created</th>

                </tr>

            </thead>

            <tbody>

    `;


    customers.forEach(
        function(customer) {

            let createdDate = "";


            if (
                customer.created_at
            ) {

                createdDate =
                    new Date(
                        customer.created_at
                    ).toLocaleDateString(
                        "en-IN"
                    );

            }


            html += `

                <tr>

                    <td>
                        ${customer.id}
                    </td>

                    <td>
                        ${customer.full_name}
                    </td>

                    <td>
                        ${customer.phone}
                    </td>

                    <td>
                        ${customer.email}
                    </td>

                    <td>
                        ${createdDate}
                    </td>

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

    `;


    container.innerHTML =
        html;

}


/* =========================================================
   DISPLAY ORDERS
========================================================= */

function renderOrders(orders) {

    const container =
        document.getElementById(
            "ordersTable"
        );


    if (!container) {

        return;

    }


    if (
        !orders ||
        orders.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-admin">

                No orders found.

            </div>

        `;

        return;

    }


    let html = `

        <table>

            <thead>

                <tr>

                    <th>Order</th>

                    <th>Customer</th>

                    <th>Cake</th>

                    <th>Total</th>

                    <th>Status</th>

                    <th>Actions</th>

                </tr>

            </thead>

            <tbody>

    `;


    /*
       Show newest orders first
    */

    orders
        .slice()
        .reverse()
        .forEach(
            function(order) {

                html += `

                    <tr>

                        <td>

                            <strong>
                                ${order.order_number}
                            </strong>

                        </td>


                        <td>

                            ${order.full_name || "Unknown"}

                            <br>

                            <small>
                                ${order.phone || ""}
                            </small>

                        </td>


                        <td>

                            ${order.cake_name}

                        </td>


                        <td>

                            ₹${Number(
                                order.total
                            ).toLocaleString(
                                "en-IN"
                            )}

                        </td>


                        <td>

                            <span
                                class="admin-status"
                            >

                                ${order.status}

                            </span>

                        </td>


                        <td>

                            <button
                                class="small-btn"
                                onclick="editOrder(${order.id})"
                            >

                                Edit

                            </button>


                            ${
                                order.status !== "Cancelled" &&
                                order.status !== "Delivered"

                                    ? `

                                        <button
                                            class="small-btn danger-btn"
                                            onclick="cancelOrder(${order.id})"
                                        >

                                            Cancel

                                        </button>

                                    `

                                    : ""

                            }

                        </td>

                    </tr>

                `;

            }
        );


    html += `

            </tbody>

        </table>

    `;


    container.innerHTML =
        html;

}


/* =========================================================
   EDIT ORDER
========================================================= */

async function editOrder(id) {

    try {

        /* ================================================
           LOAD ORDERS
        ================================================= */

        const response =
            await fetch(
                "/api/admin/orders"
            );


        const data =
            await response.json();


        if (!data.success) {

            alert(
                data.message ||
                "Unable to load order."
            );

            return;

        }


        /* ================================================
           FIND ORDER
        ================================================= */

        const order =
            data.orders.find(
                function(item) {

                    return (
                        Number(item.id) ===
                        Number(id)
                    );

                }
            );


        if (!order) {

            alert(
                "Order not found."
            );

            return;

        }


        /* ================================================
           SHOW EDIT FORM
        ================================================= */

        const editContainer =
            document.getElementById(
                "orderEditContainer"
            );


        if (editContainer) {

            editContainer.style.display =
                "block";

        }


        /* ================================================
           ORDER ID
        ================================================= */

        document.getElementById(
            "editOrderId"
        ).value =
            order.id;


        /* ================================================
           CAKE
        ================================================= */

        document.getElementById(
            "editCake"
        ).value =
            order.cake_name;


        /* ================================================
           QUANTITY
        ================================================= */

        document.getElementById(
            "editQuantity"
        ).value =
            order.quantity;


        /* ================================================
           DELIVERY DATE
        ================================================= */

        document.getElementById(
            "editDeliveryDate"
        ).value =
            formatDateForInput(
                order.delivery_date
            );


        /* ================================================
           ADDRESS
        ================================================= */

        document.getElementById(
            "editAddress"
        ).value =
            order.address;


        /* ================================================
           SPECIAL INSTRUCTIONS
        ================================================= */

        document.getElementById(
            "editInstructions"
        ).value =
            order.instructions || "";


        /* ================================================
           STATUS
        ================================================= */

        document.getElementById(
            "editStatus"
        ).value =
            order.status;


        /* ================================================
           SCROLL TO FORM
        ================================================= */

        window.scrollTo({

            top:
                editContainer.offsetTop - 30,

            behavior:
                "smooth"

        });


    } catch (error) {

        console.error(
            "Edit order error:",
            error
        );


        alert(
            "Unable to load order."
        );

    }

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDateForInput(
    dateValue
) {

    if (!dateValue) {

        return "";

    }


    /*
       If MySQL already gives
       YYYY-MM-DD
    */

    if (
        typeof dateValue === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
            dateValue
        )
    ) {

        return dateValue;

    }


    const date =
        new Date(
            dateValue
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


/* =========================================================
   HIDE ORDER EDIT
========================================================= */

function hideOrderEdit() {

    const container =
        document.getElementById(
            "orderEditContainer"
        );


    if (container) {

        container.style.display =
            "none";

    }

}


/* =========================================================
   UPDATE ORDER
========================================================= */

const orderEditForm =
    document.getElementById(
        "orderEditForm"
    );


if (orderEditForm) {

    orderEditForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            /* ============================================
               GET VALUES
            ============================================ */

            const id =
                document.getElementById(
                    "editOrderId"
                ).value;


            const cake =
                document.getElementById(
                    "editCake"
                ).value.trim();


            const quantity =
                Number(
                    document.getElementById(
                        "editQuantity"
                    ).value
                );


            const deliveryDate =
                document.getElementById(
                    "editDeliveryDate"
                ).value;


            const status =
                document.getElementById(
                    "editStatus"
                ).value;


            const address =
                document.getElementById(
                    "editAddress"
                ).value.trim();


            const instructions =
                document.getElementById(
                    "editInstructions"
                ).value.trim();


            /* ============================================
               VALIDATION
            ============================================ */

            if (!id) {

                alert(
                    "Order ID is missing."
                );

                return;

            }


            if (!cake) {

                alert(
                    "Please enter cake name."
                );

                return;

            }


            if (
                !Number.isInteger(
                    quantity
                ) ||
                quantity < 1 ||
                quantity > 20
            ) {

                alert(
                    "Quantity must be between 1 and 20."
                );

                return;

            }


            if (!deliveryDate) {

                alert(
                    "Please select delivery date."
                );

                return;

            }


            if (
                address.length < 10
            ) {

                alert(
                    "Please enter a complete delivery address."
                );

                return;

            }


            if (
                instructions.length > 300
            ) {

                alert(
                    "Special instructions cannot exceed 300 characters."
                );

                return;

            }


            /* ============================================
               UPDATE STATUS IN MYSQL
            =================================================

               IMPORTANT:

               We use the dedicated status endpoint:

               PUT /api/orders/:id/status

               This updates:

               1. orders.status
               2. order_tracking

            ================================================= */

            try {

                const response =
                    await fetch(
                        "/api/orders/" +
                        id +
                        "/status",
                        {

                            method:
                                "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    status:
                                        status

                                })

                        }
                    );


                /* ========================================
                   READ SERVER RESPONSE
                ======================================== */

                const data =
                    await response.json();


                /* ========================================
                   CHECK RESULT
                ======================================== */

                if (!data.success) {

                    console.error(
                        "Server update error:",
                        data
                    );


                    alert(
                        data.message ||
                        "Order status update failed."
                    );


                    return;

                }


                /* ========================================
                   SUCCESS
                ======================================== */

                alert(
                    "Order status updated successfully!"
                );


                /* CLOSE EDIT FORM */

                hideOrderEdit();


                /* RELOAD DASHBOARD */

                await loadAdminDashboard();


            } catch (error) {

                console.error(
                    "Status update error:",
                    error
                );


                alert(
                    "Unable to connect to the server."
                );

            }

        }
    );

}


/* =========================================================
   CANCEL ORDER
========================================================= */

async function cancelOrder(id) {

    const confirmed =
        confirm(
            "Are you sure you want to cancel this order?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                "/api/orders/" +
                id +
                "/cancel",
                {

                    method:
                        "PUT"

                }
            );


        const data =
            await response.json();


        if (!data.success) {

            alert(
                data.message ||
                "Unable to cancel order."
            );

            return;

        }


        alert(
            "Order cancelled successfully!"
        );


        await loadAdminDashboard();


    } catch (error) {

        console.error(
            "Cancel order error:",
            error
        );


        alert(
            "Unable to connect to server."
        );

    }

}


/* =========================================================
   INITIAL LOAD
========================================================= */

if (
    document.getElementById(
        "ordersTable"
    )
) {

    loadAdminDashboard();

}
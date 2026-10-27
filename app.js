// ==========================================
// LE GATEAU - SIMPLE NODE.JS BACKEND
// ==========================================

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve HTML, CSS, JS and images
app.use(express.static(__dirname));


// ==========================================
// MYSQL CONNECTION
// ==========================================


const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((error, connection) => {
    if (error) {
        console.error("MySQL connection failed:", error.message);
    } else {
        console.log("MySQL connected successfully!");
        connection.release();
    }
});



  


// ==========================================
// HOME
// ==========================================

app.get("/", function (req, res) {

    res.sendFile(__dirname + "/index.html");

});


// ==========================================
// REGISTER CUSTOMER
// ==========================================

app.post("/api/register", async function (req, res) {

    try {

        const {
            full_name,
            phone,
            email,
            password
        } = req.body;


        // Check empty fields
        if (!full_name || !phone || !email || !password) {

            return res.json({
                success: false,
                message: "Please fill all fields."
            });

        }


        // Check if email already exists
        db.query(
            "SELECT * FROM customers WHERE email = ?",
            [email],
            async function (error, results) {

                if (error) {

                    console.log(error);

                    return res.json({
                        success: false,
                        message: "Database error."
                    });

                }


                if (results.length > 0) {

                    return res.json({
                        success: false,
                        message: "Email already registered."
                    });

                }


                // Encrypt password
                const hashedPassword =
                    await bcrypt.hash(password, 10);


                // Insert customer
                const sql = `
                    INSERT INTO customers
                    (full_name, phone, email, password)
                    VALUES (?, ?, ?, ?)
                `;


                db.query(
                    sql,
                    [
                        full_name,
                        phone,
                        email,
                        hashedPassword
                    ],
                    function (error, result) {

                        if (error) {

                            console.log(error);

                            return res.json({
                                success: false,
                                message: "Registration failed."
                            });

                        }


                        res.json({

                            success: true,

                            message: "Registration successful!",

                            customer: {
                                id: result.insertId,
                                full_name: full_name,
                                email: email
                            }

                        });

                    }
                );

            }
        );

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: "Something went wrong."
        });

    }

});


// ==========================================
// LOGIN CUSTOMER
// ==========================================

app.post("/api/login", function (req, res) {

    const {
        email,
        password
    } = req.body;


    if (!email || !password) {

        return res.json({
            success: false,
            message: "Please enter email and password."
        });

    }


    db.query(
        "SELECT * FROM customers WHERE email = ?",
        [email],
        async function (error, results) {

            if (error) {

                console.log(error);

                return res.json({
                    success: false,
                    message: "Database error."
                });

            }


            if (results.length === 0) {

                return res.json({
                    success: false,
                    message: "Email not registered."
                });

            }


            const customer = results[0];


            // Compare password
            const passwordMatch =
                await bcrypt.compare(
                    password,
                    customer.password
                );


            if (!passwordMatch) {

                return res.json({
                    success: false,
                    message: "Incorrect password."
                });

            }


            res.json({

                success: true,

                message: "Login successful!",

                customer: {

                    id: customer.id,

                    full_name: customer.full_name,

                    email: customer.email,

                    phone: customer.phone

                }

            });

        }
    );

});


// ==========================================
// GET CUSTOMER INFORMATION
// ==========================================

app.get("/api/customers/:id", function (req, res) {

    const customerId = req.params.id;


    db.query(
        "SELECT id, full_name, phone, email FROM customers WHERE id = ?",
        [customerId],
        function (error, results) {

            if (error) {

                console.log(error);

                return res.json({
                    success: false,
                    message: "Database error."
                });

            }


            if (results.length === 0) {

                return res.json({
                    success: false,
                    message: "Customer not found."
                });

            }


            res.json({

                success: true,

                customer: results[0]

            });

        }
    );

});


// ==========================================
// UPDATE CUSTOMER
// ==========================================

app.put("/api/customers/:id", function (req, res) {

    const customerId = req.params.id;

    const {
        full_name,
        phone,
        email
    } = req.body;


    const sql = `
        UPDATE customers
        SET full_name = ?, phone = ?, email = ?
        WHERE id = ?
    `;


    db.query(
        sql,
        [
            full_name,
            phone,
            email,
            customerId
        ],
        function (error, result) {

            if (error) {

                console.log(error);

                return res.json({
                    success: false,
                    message: "Customer update failed."
                });

            }


            res.json({

                success: true,

                message: "Customer details updated successfully."

            });

        }
    );

});


// ==========================================
// ADD ORDER
// ==========================================

app.post("/api/orders", function (req, res) {

    const {
    customer_id,
    cake_name,
    size,
    flavour,
    frosting,
    toppings,
    quantity,
    cake_message,
    delivery_date,
    address,
    instructions,
    total
} = req.body;

    if (!customer_id) {

        return res.json({
            success: false,
            message: "Please login before placing an order."
        });

    }


    // Create order number
    const orderNumber =
        "LG" + Date.now();


    const sql = `
    INSERT INTO orders
    (
        order_number,
        customer_id,
        cake_name,
        size,
        flavour,
        frosting,
        toppings,
        quantity,
        cake_message,
        delivery_date,
        address,
        instructions,
        total,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;


        db.query(
        sql,
        [
            orderNumber,
            customer_id,
            cake_name,
            size || "Standard",
            flavour || "",
            frosting || "",
            toppings || "None",
            quantity,
            cake_message || "",
            delivery_date,
            address,
            instructions || "",
            total,
            "Order Placed"
        ],
        function (error, result) {

            if (error) {
                console.log(error);

                return res.json({
                    success: false,
                    message: "Order could not be placed."
                });
            }

            const orderId = result.insertId;

            // Add first tracking status
            db.query(
                `INSERT INTO order_tracking
                 (order_id, status)
                 VALUES (?, ?)`,
                [
                    orderId,
                    "Order Placed"
                ],
                function (trackingError) {

                    if (trackingError) {
                        console.log(trackingError);
                    }

                    res.json({
                        success: true,
                        message: "Order placed successfully!",
                        order: {
                            id: orderId,
                            order_number: orderNumber
                        }
                    });
                }
            );
        }
    );

});
    
// ==========================================
// GET ORDERS FOR ONE CUSTOMER
// ==========================================

app.get("/api/orders/customer/:customerId", function (req, res) {

    const customerId = req.params.customerId;


    const sql = `

        SELECT *

        FROM orders

        WHERE customer_id = ?

        ORDER BY order_date DESC

    `;


    db.query(

        sql,

        [customerId],

        function (error, orders) {

            if (error) {

                console.log(error);

                return res.json({

                    success: false,
                    message: "Could not load orders."

                });

            }


            if (orders.length === 0) {

                return res.json({

                    success: true,

                    orders: []

                });

            }


            // Get tracking information
            let completed = 0;


            orders.forEach(function (order) {

                db.query(

                    `

                    SELECT status, update_time

                    FROM order_tracking

                    WHERE order_id = ?

                    ORDER BY update_time ASC

                    `,

                    [order.id],

                    function (trackingError, tracking) {

                        if (trackingError) {

                            console.log(trackingError);

                            order.tracking = [];

                        } else {

                            order.tracking = tracking;

                        }


                        completed++;


                        if (completed === orders.length) {

                            res.json({

                                success: true,

                                orders: orders

                            });

                        }

                    }

                );

            });

        }

    );

});


// ==========================================
// UPDATE ORDER
// ==========================================

app.put("/api/orders/:id", function (req, res) {

    const orderId = req.params.id;


    const {

        cake_name,
        size,
        flavour,
        frosting,
        quantity,
        cake_message,
        delivery_date,
        address,
        instructions,
        total

    } = req.body;


    const sql = `

        UPDATE orders

        SET
            cake_name = ?,
            size = ?,
            flavour = ?,
            frosting = ?,
            quantity = ?,
            cake_message = ?,
            delivery_date = ?,
            address = ?,
            instructions = ?,
            total = ?

        WHERE id = ?

    `;


    db.query(

        sql,

        [

            cake_name,
            size,
            flavour,
            frosting,
            quantity,
            cake_message,
            delivery_date,
            address,
            instructions,
            total,
            orderId

        ],

        function (error) {

            if (error) {

                console.log(error);

                return res.json({

                    success: false,
                    message: "Order update failed."

                });

            }


            res.json({

                success: true,

                message: "Order updated successfully."

            });

        }

    );

});


// ==========================================
// CANCEL ORDER
// ==========================================

app.put("/api/orders/:id/cancel", function (req, res) {

    const orderId = req.params.id;


    db.query(

        `
        UPDATE orders

        SET status = 'Cancelled'

        WHERE id = ?

        AND status NOT IN ('Delivered', 'Cancelled')

        `,

        [orderId],

        function (error, result) {

            if (error) {

                console.log(error);

                return res.json({

                    success: false,
                    message: "Could not cancel order."

                });

            }


            if (result.affectedRows === 0) {

                return res.json({

                    success: false,

                    message:
                        "Order cannot be cancelled."

                });

            }


            // Add tracking update
            db.query(

                `

                INSERT INTO order_tracking
                (order_id, status)

                VALUES (?, ?)

                `,

                [
                    orderId,
                    "Cancelled"
                ]

            );


            res.json({

                success: true,

                message: "Order cancelled successfully."

            });

        }

    );

});


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

app.put("/api/orders/:id/status", function (req, res) {

    const orderId = req.params.id;

    const {
        status
    } = req.body;


    const allowedStatuses = [

        "Order Placed",
        "Order Confirmed",
        "Baking",
        "Decorating",
        "Out for Delivery",
        "Delivered",
        "Cancelled"

    ];


    if (!allowedStatuses.includes(status)) {

        return res.json({

            success: false,

            message: "Invalid order status."

        });

    }


    // Update order
    db.query(

        `
        UPDATE orders

        SET status = ?

        WHERE id = ?

        `,

        [
            status,
            orderId
        ],

        function (error) {

            if (error) {

                console.log(error);

                return res.json({

                    success: false,

                    message: "Status update failed."

                });

            }


            // Save tracking history
            db.query(

                `

                INSERT INTO order_tracking

                (order_id, status)

                VALUES (?, ?)

                `,

                [
                    orderId,
                    status
                ],

                function (trackingError) {

                    if (trackingError) {

                        console.log(trackingError);

                    }

                }

            );


            res.json({

                success: true,

                message: "Order status updated."

            });

        }

    );

});


// ==========================================
// ADMIN - VIEW ALL ORDERS
// ==========================================

app.get("/api/admin/orders", function (req, res) {

    const sql = `

        SELECT

            orders.*,

            customers.full_name,

            customers.email,

            customers.phone

        FROM orders

        JOIN customers

        ON orders.customer_id = customers.id

        ORDER BY orders.order_date DESC

    `;


    db.query(

        sql,

        function (error, results) {

            if (error) {

                console.log(error);

                return res.json({

                    success: false,
                    message: "Could not load orders."

                });

            }


            res.json({

                success: true,

                orders: results

            });

        }

    );

});


// ==========================================
// ADMIN - VIEW ALL CUSTOMERS
// ==========================================

app.get("/api/admin/customers", function (req, res) {

    db.query(

        `
        SELECT id, full_name, phone, email, created_at
        FROM customers
        ORDER BY created_at DESC
        `,

        function (error, results) {

            if (error) {

                console.log(error);

                return res.json({

                    success: false,
                    message: "Could not load customers."

                });

            }


            res.json({

                success: true,

                customers: results

            });

        }

    );

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, function () {

    console.log("----------------------------------");

    console.log("LE GATEAU SERVER STARTED");

    console.log(
        "Open: http://localhost:" + PORT
    );

    console.log("----------------------------------");

});

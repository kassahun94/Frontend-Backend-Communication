import mysql from "mysql";
import express from "express";
import cors from "cors";
import bodyparser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const connection = mysql.createConnection({
	socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
	user: "myDBuser",
	password: "kassahun2024",
	database: "myDB",
});

connection.connect((err) => {
	if (err) {
		console.log("Error connecting to MySQL:", err);
	} else {
		console.log("Connected to MySQL");
	}
});

// Create the tables
app.get("/install", (req, res) => {
	let message = "Tables Created";

	let createProducts = `CREATE TABLE if not exists Products(
        product_id int auto_increment,
        product_url varchar(255) not null,
        product_name varchar(255) not null,
        PRIMARY KEY (product_id)
    )`;

	let createProductDescription = `CREATE TABLE if not exists ProductDescription(
        description_id int auto_increment,
        product_id int(11) not null,
        product_brief_description TEXT not null,
        product_description TEXT not null,
        product_img varchar(255) not null,
        product_link varchar(255) not null,
        PRIMARY KEY (description_id),
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
    )`;

	let createProductPrice = `CREATE TABLE if not exists ProductPrice(
        price_id int auto_increment,
        product_id int(11) not null,    
        starting_price varchar(255) not null,
        price_range varchar(255) not null,
        PRIMARY KEY (price_id),
        FOREIGN KEY (product_id) REFERENCES Products(product_id)
    )`;

	let createUsers = `CREATE TABLE if not exists Users(
        user_id int auto_increment,
        user_name varchar(255) not null,
        user_password varchar(255) not null,
        PRIMARY KEY (user_id)
    )`;

	let createOrders = `CREATE TABLE if not exists Orders(
        order_id int auto_increment,
        product_id int(11) not null,
        user_id int(11) not null,
        PRIMARY KEY (order_id),
        FOREIGN KEY (product_id) REFERENCES Products(product_id),
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
    )`;

	connection.query(createProducts, (err) => {
		if (err) {
			console.log("Error creating Products table:", err);
			res.status(500).send("Error creating Products table");
			return;
		}
	});

	connection.query(createProductDescription, (err) => {
		if (err) {
			console.log("Error creating ProductDescription table:", err);
			res.status(500).send("Error creating ProductDescription table");
			return;
		}
	});

	connection.query(createProductPrice, (err) => {
		if (err) {
			console.log("Error creating ProductPrice table:", err);
			res.status(500).send("Error creating ProductPrice table");
			return;
		}
	});

	connection.query(createUsers, (err) => {
		if (err) {
			console.log("Error creating Users table:", err);
			res.status(500).send("Error creating Users table");
			return;
		}
	});

	connection.query(createOrders, (err) => {
		if (err) {
			console.log("Error creating Orders table:", err);
			res.status(500).send("Error creating Orders table");
			return;
		}
	});

	res.end(message);
});

// Insert a new iPhone
app.post("/addiphones", (req, res) => {
	let {
		iphoneId,
		imgPath,
		iphoneLink,
		ProductName,
		briefDescription,
		StartPrice,
		priceRange,
		fullDescription,
	} = req.body;

	let sqlAddToProducts = `INSERT INTO Products (product_url, product_name) VALUES (?, ?)`;

	connection.query(
		sqlAddToProducts,
		[iphoneId, ProductName],
		(err, results) => {
			if (err) {
				console.log("Error inserting into Products:", err);
				res.status(500).send("Error inserting into Products");
				return;
			}

			let addedProductId = results.insertId;

			let sqlAddToProductDescription = `INSERT INTO ProductDescription (product_id, product_brief_description, product_description, product_img, product_link) VALUES (?, ?, ?, ?, ?)`;
			let sqlAddToProductPrice = `INSERT INTO ProductPrice (product_id, starting_price, price_range) VALUES (?, ?, ?)`;

			connection.query(
				sqlAddToProductDescription,
				[
					addedProductId,
					briefDescription,
					fullDescription,
					imgPath,
					iphoneLink,
				],
				(err) => {
					if (err) {
						console.log("Error inserting into ProductDescription:", err);
						res.status(500).send("Error inserting into ProductDescription");
						return;
					}
					console.log("Product description inserted");

					connection.query(
						sqlAddToProductPrice,
						[addedProductId, StartPrice, priceRange],
						(err) => {
							if (err) {
								console.log("Error inserting into ProductPrice:", err);
								res.status(500).send("Error inserting into ProductPrice");
								return;
							}
							console.log("Product price inserted");
							res.send("Product added");
						}
					);
				}
			);
		}
	);
});

// Get all iPhones
app.get("/iphones", (req, res) => {
	let sql = `SELECT * FROM Products 
                JOIN ProductDescription ON Products.product_id = ProductDescription.product_id 
                JOIN ProductPrice ON Products.product_id = ProductPrice.product_id`;

	connection.query(sql, (err, rows) => {
		if (err) {
			console.log("Error fetching iPhones:", err);
			res.status(500).send("Error fetching iPhones");
			return;
		}
		res.json({ products: rows });
	});
});

app.listen(3001, () => console.log("Listening on port 3001"));

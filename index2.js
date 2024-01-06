var express = require("express");
var app = express();
var mysql = require("mysql");
var bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest: "upload/" });
app.set("view engine", "ejs");
var cors = require("cors");
var nodemailer = require('nodemailer');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "web"
});
conn.connect(function (err) {
    if (err)
        throw err;
    console.log("Connection successful");
});

var server = app.listen(4000, function () { console.log("app running on 4000"); });

app.get("/", function (req, res) {
    res.render("form");
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./upload");
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    },
});

//post:   insert data and use to get single row
//get:    get all rows or table
//delete: delete all rows or sepecific row
//put:    update any row

app.post("/insertreseller", function (req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var address = req.body.address;
    var phone = req.body.phone;




    var sql = `insert into reseller (name,email,password,address,phone) values ('${name}','${email}','${password}','${address}','${phone}')`;


    var data = [name, email, password, address, phone];
    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        res.send(results);
    });
});

app.post("/insertsupplier", function (req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var address = req.body.address;
    var phone = req.body.phone;
    var sql = `insert into supplier (name,email,password,address,phone) values ('${name}','${email}','${password}','${address}','${phone}')`;


    var data = [name, email, password, address, phone];
    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        res.send(results);
    });
});
const uploadImg = multer({ storage });
app.post("/insertproduct", uploadImg.single("image"), function (req, res) {
    var title = req.body.title;
    var description = req.body.description;
    var price = req.body.price;
    var image = req.file.filename;
    var supplier = req.body.supplier;
    var sql = `insert into product (title,description,image,price,supplierID) values ('${title}','${description}','${image}','${price}','${supplier}')`;
    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        res.send(results);
    });
});
app.post("/getproduct", function (req, res) {
    var supplier = req.body.supplier;
    console.log(supplier);
    var data = [supplier];
    var sql = `Select * from product where supplierID = '${supplier}'`;
    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        res.send(results);
    });
});
app.get("/getallproduct", function (req, res) {

    var sql = `Select * from product `;
    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        res.send(results);
    });
});

app.get("/getblog", function (req, res) {
    var sql = `Select * from blog `;
    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        res.send(results);
    });
});
app.post("/getsupplier", function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var sql = `Select * from supplier where email = '${email}' AND password = '${password}'  `;
    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        res.send(results);
    });
});
app.post("/getadmin", function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var sql = `Select * from admin where email = '${email}' AND password = '${password}'  `;
    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        res.send(results);
    });
});
app.post("/getreseller", function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var sql = `Select * from reseller where email = '${email}' AND password = '${password}'  `;
    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        res.send(results);
    });
});


app.post("/insertcart", function (req, res) {

    var resellerId = req.body.resellerId;
    var productId = req.body.productId;


    console.log(productId);
    var sql = `insert into cart (resellerId,productId) values ('${resellerId}', '${productId}')`;



    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        res.send(results);
    });
});
app.post("/placeorder", function (req, res) {

    var resellerId = req.body.resellerId;
    var name = req.body.name;
    var phone = req.body.phone;
    var longitude = req.body.longitude;
    var lattitude = req.body.lattitude;
    var bill = req.body.bill;
    var orderId = req.body.orderId;
    var status = "Pending";
    data = [orderId, resellerId, name, phone, lattitude, longitude, bill, status];
    var sql = `insert into orders (id,resellerId,name,phone,lattitude,longitude,bill,status) values (?,?,?,?,?,?,?,?)`;



    conn.query(sql, data, function (err, results) {
        if (err)
            throw err;

    });


    sql = `insert into orderList(orderId,resellerId,productid,quantity,supplier,status) Select ?,?,p.id,(SELECT COUNT(*) FROM cart c WHERE c.productid = p.id AND c.resellerId = '${resellerId}') AS quantity,p.supplierId,? FROM product p
    JOIN cart c ON p.id = c.productid
    WHERE c.resellerId = '${resellerId}'
    GROUP BY p.id`
    data = [orderId, resellerId, status];
    conn.query(sql, data, function (err, results) {
        if (err)
            throw err;
        res.send(results);
    });
});

app.post("/insertcart", function (req, res) {

    var resellerId = req.body.resellerId;
    var productId = req.body.productId;


    console.log(productId);
    var sql = `insert into cart (resellerId,productId) values ('${resellerId}', '${productId}')`;



    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        res.send(results);
    });
});

app.post("/insertsupplier", function (req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var address = req.body.address;
    var phone = req.body.phone;
    var sql = `insert into supplier (name,email,password,address,phone) values ('${name}','${email}','${password}','${address}','${phone}')`;


    var data = [name, email, password, address, phone];
    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        res.send(results);
    });


});


app.delete("/deletefromcart", function (req, res) {
    var resellerId = req.body.resellerId;
    var productId = req.body.productId;

    var sql = `DELETE FROM cart WHERE resellerId = '${resellerId}' AND productId = '${productId}'`;

    conn.query(sql, function (err, result) {
        if (err) {
            res.status(500).send("Error deleting record");
        } else {
            res.send("Record deleted successfully");
        }
    });
});

app.delete("/clearcart", function (req, res) {

    var sql = `DELETE FROM cart `;

    conn.query(sql, function (err, result) {
        if (err) {
            res.status(500).send("Error deleting record");
        } else {
            res.send("Record deleted successfully");
        }
    });
});

app.post("/getcart", function (req, res) {
    var resellerId = req.body.resellerId;
    console.log(resellerId);
    var sql = `SELECT p.*, (SELECT COUNT(*) FROM cart c WHERE c.productid = p.id AND c.resellerId = '${resellerId}') AS quantity
    FROM product p
    JOIN cart c ON p.id = c.productid
    WHERE c.resellerId = '${resellerId}'
    GROUP BY p.id`;
    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        res.send(results);
    });
});



app.post("/getOrders", function (req, res) {

    var resellerId = req.body.resellerId;


    var sql = `Select * from orders where resellerId = '${resellerId}'`;



    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        console.log(resellerId);
        res.send(results);
    });
});

app.post("/getAllOrdersList", function (req, res) {
    var orderId = req.body.orderId;

    var sql = `Select * from orderlist where orderId = '${orderId}'`;



    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        res.send(results);
    });
});
app.get("/getAllOrders", function (req, res) {

    var sql = `SELECT o.id AS id, o.name AS name, o.phone AS phone, o.longitude AS longitude, o.lattitude AS latitude, o.bill AS bill, o.Status AS Status, ol.supplier AS supplier, ol.productId AS productId, ol.resellerId AS resellerId, ol.quantity AS quantity, ol.Status AS substatus, COUNT(ol.orderId) AS orderCount FROM orders o JOIN orderlist ol ON o.id = ol.orderId GROUP BY o.id`;




    conn.query(sql, function (err, results) {
        if (err)
            throw err;

        res.send(results);
    });
});

app.post("/getSupplierOrders", function (req, res) {

    var supplierId = req.body.supplierId;


    var sql = `Select * from orderlist ol Join product p ON ol.productId = p.id  where ol.supplier = '${supplierId}'`;
    console.log(supplierId);


    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);
        res.send(results);
    });
});

app.put("/approveSupplierOrder", function (req, res) {

    var id = req.body.id;
    var orderId = req.body.orderId
    var status = "Processing";
    console.log(orderId);
    var sql = `Update orderlist set Status = '${status}' where productId = '${id}' AND  orderId = '${orderId}'`;


    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);

        res.send(results);
    });
});
app.put("/approveOrder", function (req, res) {

    var id = req.body.id;

    var status = "Paid";

    var sql = `Update orders set Status = '${status}' where id = '${id}'`;


    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);

        res.send(results);
    });
});
app.put("/rejectOrder", function (req, res) {

    var id = req.body.id;

    var status = "Cancelled";

    var sql = `Update orders set Status = '${status}' where id = '${id}'`;


    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);

        res.send(results);
    });
});

app.put("/rejectSupplierOrder", function (req, res) {

    var id = req.body.id;
    var orderId = req.body.orderId
    var status = "Cancelled";
    console.log(orderId);
    var sql = `Update orderlist set Status = '${status}' where productId = '${id}' AND  orderId = '${orderId}'`;


    conn.query(sql, function (err, results) {
        if (err)
            throw err;
        console.log(results);

        res.send(results);
    });
});

// Create a transporter object with your email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gemavenuestore@gmail.com',
        pass: 'ijkeyejazkamidhz'
    }
});
app.post("/sendverifcationcode", function (req, res) {


    var email = req.body.email;
    var code = req.body.code;
    console.log(code);
    const mailOptions = {
        from: 'gemavenuestore@gmail.com',
        to: email,
        subject: 'Gem Avenue Verification Code',
        text: 'code is ' + code
    };

    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });


});

app.post("/contactus", function (req, res) {


    var email = req.body.email;
    var message = req.body.message;
    console.log(code);
    const mailOptions = {
        from: 'gemavenuestore@gmail.com',
        to: 'f200232@cfd.nu.edu.pk',
        subject: 'Contact Us',
        text: email + " message : " + message
    };

    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });


});

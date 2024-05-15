const express = require("express");
const { MongoClient } = require("mongodb"); 
const bodyParser = require("body-parser");
const app = express();
const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));


const mongoUrl = "mongodb://localhost:27017/";
const dbName = "Student";
let db; 

MongoClient.connect(mongoUrl)
    .then((client) => {
        db = client.db(dbName); 
        console.log(`Connected to MongoDB: ${dbName}`);
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); 
    });

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/insert", async (req, res) => {
    const { firstName,lastName,emailId  } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
        await db.collection("login").insertOne({ firstName,lastName,emailId });
        console.log("Number of documents inserted: " + res.insertedCount);
        res.redirect("/"); 
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
});
app.post("/update", async(req,res)=>{
    const {name, firstName,lastName,emailId  } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
       
        await db.collection("login").updateOne(
            { firstName: name }, // Filter criteria
            { $set: { firstName: firstName, lastName: lastName,emailId:emailId } } // Update operation
          );
          
        res.redirect("/"); 
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }

});
app.post("/delete", async(req,res)=>{
    const {firstName} = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
       
        await db.collection("login").deleteOne({ firstName:firstName});
        res.redirect("/"); 
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }

});
app.get("/get", (req, res) => {
    res.sendFile(__dirname + "/get.html");
});

app.get("/view", async (req, res) => {
    try {
        const items = await db.collection("login").find().toArray(); 

        let tableContent = `
            <style>
            *{
                margin: 0;
                padding-right: 10px;
                padding-left: 10px;
                align-items: center;
                box-sizing: border-box;
                font-family: 'Poppins',sans-serif;
                
            }
            body{
                background: linear-gradient(135deg, #71b7e6,#9b59b6);
            }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #dddddd;
                    text-align: left;
                    padding: 8px;
                }
                th {
                    background-color: #f2f2f2;
                }
                td {
                    background-color: #cccbcb;
                }
                .button{
                    height: 45px;
                    margin: 45px 0;
                }
                .button button{
                    height: 100%;
                    
                    outline: none;
                    color: #ffffff;
                    margin: 4px ;
                    color: #333333;
                    border-color: #9b59b6;
                    box-shadow: #9b59b6;
                    font-weight: bold;
                    font-family: Algerian;
                    
                }
                .button button a{
                    text-decoration: none;
                }
            </style>
            <body>
            <h1>Report</h1>
            <table>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email ID</th>
                </tr>
            <body>`
            ;

        tableContent += items.map(item => `
            <tr>
                <td>${item.firstName}</td>
                <td>${item.lastName}</td>
                <td>${item.emailId}</td>
            </tr>`).join("");

        tableContent += "</table><br><div class='button'><button type='submit'><a href='/'>Back to form</a></button></div>"; 

        res.send(tableContent);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
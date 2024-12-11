const functions = require("firebase-functions");

const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const express = require("express");
const cors = require("cors");

//Main app
const app = express();
app.use(cors({origin: true}));

const db = admin.firestore();

//Routes
app.get("/", (req, res) => {
    return res.status(200).send("Hello there!!!");
});

//Create api using -> post()
app.post("/api/create", (req, res) => {
    (async () => {
        try {
            await db.collection("users").doc(`/${Date.now()}/`).create({
                id: Date.now(),
                name: req.body.name,
                mobile: req.body.mobile,
                address: req.body.address
            });

            return res.status(200).send({status: "success", msg: "Data created successfully"});
        } catch (error) {
            console.log(error);
            return res.status(500).send({status: "error", msg: error});
        }
    })();
})
//get api by -> get()
//fetch - single data from firestore using specific id

app.get("/api/get/:id", (req, res) => {
    (async () => {
        try {
            const reqDoc = db.collection("users").doc(req.params.id);// It will create a reference of the document
            let userDetail = await reqDoc.get();// It will get the document 
            let response = userDetail.data();// It will get the data of the document

            return res.status(200).send({status: "success", data: response});
        } catch (error) {
            console.log(error);
            return res.status(500).send({status: "error", msg: error});
        }
    })();
})

//Fetch - all data from firestore
app.get("/api/getAll", (req, res) => {
    (async () => {
        try {
           const query = db.collection("users");// Reading the collection
           let response = []; // Empty array to store the data

           await query.get().then((data) => {
            let docs = data.docs; // It will get all the documents
            docs.map((doc) => { // It will loop through all the documents and will get the data
                const selectedData = {
                    name: doc.data().name,
                    mobile: doc.data().mobile,
                    address: doc.data().address
                };

                response.push(selectedData);// It will push the data in the array
            });
            return response;
           });


            return res.status(200).send({status: "Success", data: response});
        } catch (error) {
            console.log(error);
            return res.status(500).send({status: "error", msg: error});
        }
    })();
})

//update api by -> put()
app.put("/api/update/:id", (req, res) => {
    (async () => {
        try {
            const reqDoc = db.collection("users").doc(req.params.id);// It will create a reference of the document
            await reqDoc.update({
                name: req.body.name,
                mobile: req.body.mobile,
                address: req.body.address
            });// It will update the document

            return res.status(200).send({status: "Success", msg: "Data updated successfully"});
        } catch (error) {
            console.log(error);
            return res.status(500).send({status: "error", msg: error});
        }
    })();
});

 
//delete api by -> delete()
app.delete("/api/delete/:id", (req, res) => {
    (async () => {
        try {
            const reqDoc = db.collection("users").doc(req.params.id);// It will create a reference of the document
            await reqDoc.delete();// It will delete the document
            

            return res.status(200).send({status: "Success", msg: "Data removed successfully"});
        } catch (error) {
            console.log(error);
            return res.status(500).send({status: "error", msg: error});
        }
    })();
});

// exports the api to firebase cloud functions 
exports.app = functions.https.onRequest(app);

const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Error-handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON');
    return res.status(400).send({ success: false, error: 'Invalid JSON payload' });
  }
  next();
});

mongoose.connect("mongodb+srv://bkipgaa:P6dSy42TBGVsHXeo@cluster0.qggw3h3.mongodb.net/e-commerce")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// API Creation
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res) => {
  console.log('Upload request received');
  if (req.file) {
    console.log('File received:', req.file);
    res.json({
      success: 1,
      image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
  } else {
    console.error('No file received');
    res.json({
      success: 0,
      error: 'No file received'
    });
  }
});

// Product Schema and Endpoints
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  }
});

app.post('/addproduct', async (req, res) => {
  console.log('Add product request received');
  console.log('Request body:', req.body);

  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product = products[products.length - 1];
    id = last_product.id + 1;
  } else {
    id = 1;
  }

  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  console.log(product); // Log the product object before saving

  product.save()
    .then(() => {
      console.log("Product saved successfully");
      res.json({
        success: true,
        name: req.body.name,
      });
    })
    .catch(error => {
      console.error('Error saving product:', error);
      res.json({
        success: false,
        error: error.message,
      });
    });
});

app.post('/removeproduct', async (req, res) => {
  console.log('Remove product request received');
  console.log('Request body:', req.body);

  Product.findOneAndDelete({ id: req.body.id })
    .then(() => {
      console.log("Product removed successfully");
      res.json({
        success: true,
        name: req.body.name,
      });
    })
    .catch(error => {
      console.error('Error removing product:', error);
      res.json({
        success: false,
        error: error.message,
      });
    });
});

// Creating API for getting all products
app.get('/allproducts', async (req, res) => {
  console.log('Get all products request received');
  Product.find({})
    .then(products => {
      console.log("All products fetched successfully");
      res.send(products);
    })
    .catch(error => {
      console.error('Error fetching products:', error);
      res.json({
        success: false,
        error: error.message,
      });
    });
});

// Schema Creation for User model
const Users = mongoose.model('Users', {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

// Creating Endpoint for registering the user
app.post('/signup', async (req, res) => {
  // Check if a user with the same email already exists
  Users.findOne({ email: req.body.email })
    .then(check => {
      if (check) {
        return res.status(400).json({ success: false, errors: "Existing user found with the same email" });
      }

      // Initialize the cart with 300 items set to 0
      let cart = {};
      for (let i = 0; i < 300; i++) {
        cart[i] = 0;
      }

      // Create a new user with the provided information and initialized cart
      const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
      });

      user.save()
        .then(() => {
          // Create a token with the user's ID
          const data = {
            user: {
              id: user.id
            }
          };
          const token = jwt.sign(data, 'secret_ecom');

          // Send a success response with the token
          res.json({ success: true, token });
        })
        .catch(error => {
          res.status(500).json({ success: false, error: error.message });
        });
    })
    .catch(error => {
      res.status(500).json({ success: false, error: error.message });
    });
});

// Creating Endpoint for user login
app.post('/login', async (req, res) => {
  Users.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
          const data = {
            user: {
              id: user.id
            }
          };
          const token = jwt.sign(data, 'secret_ecom');
          res.json({ success: true, token });
        } else {
          res.json({ success: false, errors: "Wrong Password" });
        }
      } else {
        res.json({ success: false, errors: "Wrong Email Id" });
      }
    })
    .catch(error => {
      res.status(500).json({ success: false, error: error.message });
    });
});


//Creating endpoint for newcollection data
app.get('/newcollections' ,async(req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched")
    res.send(newcollection)
})

//creating endpoint for popular in women section

app.get('/popularinwomen', async (req,res)=>{
  let products = await Product.find({category:"women"});
  let popular_in_women = products.slice(0,4);
  console.log("Popular in women fetched");
  res.send(popular_in_women);
})

//creating middlware to fetch user
const fetchUser = async (req,res,next)=>{
  const token = req.header('auth-token');
  if (!token){
    res.status(401).send({errors:"Please authenticate using valid token"})
  }
  else{
    try{
      const data = jwt.verify(token, 'secret_ecom');
      req.user = data.user;
      next();
    } catch (error) {
        res.status(401).send({errors:"please authenticate using a valid token"})
    }
  }
}

//creating endpoint for adding products in cartdata
app.post('/addtocart', fetchUser, async(req,res)=>{
  console.log("added", req.body.itemId);
  let userData = await Users.findOne({_id:req.user.id}) //storing based on id
  userData.cartData[req.body.itemId] +=1;
  await Users.findOneAndUpdate({_id:req.user.id},
    {cartData:userData.cartData}
  )
  res.send("Added")
})

//creating endpoint to remove product from cartdata
app.post('/removefromcart', fetchUser, async (req,res)=>{
  console.log("removed", req.body.itemId);
  let userData = await Users.findOne({_id:req.user.id}) //storing based on id
  if (userData.cartData [req.body.itemId]>0)
  userData.cartData[req.body.itemId] -=1;
  await Users.findOneAndUpdate({_id:req.user.id},
    {cartData:userData.cartData}
  )
  res.send("Removed")
})

//creating endpoint to get cartdata
app.post('/getcart', fetchUser, async(req,res)=>{
      console.log("GetCart");
      let userData = await Users.findOne({_id:req.user.id});
      res.json(userData.cartData)
})


app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port " + port);
  } else {
    console.log("Error: " + error);
  }
});

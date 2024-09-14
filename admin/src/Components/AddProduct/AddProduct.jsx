import React, { useState } from 'react' // Import React and useState hook
import './AddProduct.css' // Import CSS file for styling
import upload_area from '../../assets/upload_area.svg' // Import default upload area image

const AddProduct = () => {

    // Initialize state for image with null
    const [image, setImage] = useState(false);

    // Initialize state for product details with default values
    const [productDetails, setProductDetails] = useState({
        name: "",
        image: '',
        category: "women",
        new_price: "",
        old_price: ""
    });

    // Function to handle image selection
    const imageHandler = (e) => {
        setImage(e.target.files[0]); // Set the selected file as the image
        console.log('Selected image:', e.target.files[0]);
    }

    // Function to handle changes in input fields
    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value }) // Update the corresponding field in productDetails
        console.log('Updated product details:', { ...productDetails, [e.target.name]: e.target.value });
    }

    // Function to handle adding the product
    const Add_Product = async () => {
        console.log('Adding product with details:', productDetails); // Log the current product details to the console

        // Initialize variables
        let responseData;
        let product = { ...productDetails }; // Use a copy of the product details

        // Create a FormData object and append the image
        let formData = new FormData();
        formData.append('product', image);

        // Make a POST request to upload the image
        await fetch('http://localhost:4000/upload', {
            method: 'POST',
            headers: {
                Accept: 'application/json', // Set the Accept header to receive JSON
            },
            body: formData // Set the request body to the FormData object
        }).then((resp) => resp.json()) // Parse the response as JSON
            .then((data) => {
                console.log('Image upload response:', data); // Log the response data
                responseData = data;
            }).catch(error => {
                console.error('Error during image upload:', error); // Log any error during the upload
            });

        // If the upload is successful, update the product image URL
        if (responseData && responseData.success) {
            product.image = responseData.image_url;
            console.log('Updated product details with image URL:', product); // Log the updated product details

            await fetch('http://localhost:4000/addproduct', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),
            }).then((resp) => resp.json()).then((data) => {
                console.log('Add product response:', data); // Log the response from adding product
                data.success?alert("Product Added") : alert("Failed");
            }).catch(error => {
                console.error('Error during product addition:', error); // Log any error during adding product
            });
        } else {
            console.error('Image upload was not successful:', responseData); // Log if image upload was not successful
        }
    }

    return (
        <div className='add-product'> {/* Main container for the add product form */}
            <div className="addproduct-itemfield"> {/* Container for the product title input */}
                <p>Product title</p>
                <input value={productDetails.name} onChange={changeHandler} type="text" name="name" placeholder='Type here' /> {/* Input for product title */}
            </div>
            <div className="addproduct-price"> {/* Container for the old price input */}
                <div className="addproduct-itemfield">
                    <p>Price</p>
                    <input value={productDetails.old_price} onChange={changeHandler} type="text" name="old_price" placeholder='Type here' /> {/* Input for old price */}
                </div>
            </div>
            <div className="addproduct-price"> {/* Container for the new price input */}
                <div className="addproduct-itemfield">
                    <p>Offer Price</p>
                    <input value={productDetails.new_price} onChange={changeHandler} type="text" name="new_price" placeholder='Type here' /> {/* Input for new price */}
                </div>
            </div>
            <div className="addproduct-itemfield"> {/* Container for the product category selector */}
                <p>Product Category</p>
                <select value={productDetails.category} onChange={changeHandler} name='category' className='add-product-selector'> {/* Dropdown for category */}
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kid">Kid</option>
                </select>
            </div>
            <div className="addproduct-itemfield"> {/* Container for the image upload */}
                <label htmlFor='file-input'>
                    <img src={image ? URL.createObjectURL(image) : upload_area} className='addproduct-thumnail-img' /> {/* Display selected image or default upload area image */}
                </label>
                <input type='file' name='image' id='file-input'
                    onChange={imageHandler} // Attach the onChange event handler to trigger imageHandler function and update
                    hidden />
            </div>
            <button onClick={() => { Add_Product() }} className='addproduct-btn'>ADD</button> {/* Button to add the product */}
        </div>
    )
}

export default AddProduct
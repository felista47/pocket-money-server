const axios = require('axios');

const createTokenAndRegisterIPN = async () => {
    const data = JSON.stringify({
        "consumer_key": "qkio1BGGYAXTu2JOfm7XSXNruoZsrqEW",
        "consumer_secret": "osGQ364R49cXKeOYSpaOnT++rHs="
    });

    try {
        // Create token request
        const tokenResponse = await axios.post("https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken", data, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        const tokenData = tokenResponse.data;
        const token = tokenData.token;

        // Register IPN request
        const ipnRegistrationUrl = "https://cybqa.pesapal.com/pesapalv3/api/URLSetup/RegisterIPN";

        const ipnData = JSON.stringify({
            "url": " https://pocket-money.up.railway.app/ipn",
            "ipn_notification_type": "GET"
        });

        const ipnHeaders = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };

        const ipnResponse = await axios.post(ipnRegistrationUrl, ipnData, { headers: ipnHeaders });

        const ipnResponseData = ipnResponse.data;
        const ipnId = ipnResponseData.ipn_id;
        const ipnUrl = ipnResponseData.url;

        console.log("IPN registration successful");
        console.log("IPN ID:", ipnId);
        console.log("IPN URL:", ipnUrl);

        return { token, ipnId, ipnUrl };
    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
};




const submitOrder = async (req,res,next) => {
    try {
        const { token, ipnId } = await createTokenAndRegisterIPN();
        const merchantReference = Math.floor(Math.random() * 1000000000000000000);
        const phone = "0745825378";
        const amount = 1.00;
        const callbackUrl = "https://pocket-money.up.railway.app/payment/confirmation";
        const branch = "Manoti";
        const firstName = "Felista";
        const middleName = "Manoti";
        const lastName = "Sawe";
        const emailAddress = "manotifelista9@gmail.com";     

        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };

        const data = {
            "id": `${merchantReference}`,
            "currency": "KES",
            "amount": amount,
            "description": "Payment description goes here",
            "callback_url": `${callbackUrl}`,
            "notification_id": `${ipnId}`,
            "branch": `${branch}`,
            "billing_address": {
                "email_address": `${emailAddress}`,
                "phone_number": `${phone}`,
                "country_code": "KE",
                "first_name": `${firstName}`,
                "middle_name": `${middleName}`,
                "last_name": `${lastName}`,
                "line_1": "Pesapal Limited",
                "line_2": "",
                "city": "",
                "state": "",
                "postal_code": "",
                "zip_code": ""
            }
        };

        const response = await axios.post("https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest", data, { headers });
        console.log("Order submission successful:");
        console.log(response.data);
        // Operation b4 submitting response to client.
        req.transactionID=response.data.order_tracking_id
        req.token =token
        res.status(200).json({ message: "Order submitted successfully",response:response.data});
    } catch (error) {
        console.error("Error submitting order:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
    }
};

const confirmPayment =async (req,res)=>{
console.log(req)
console.log("Huray! We received some data")
console.log(req.body);
res.status(200);
}



const getTransactionStatus = async (req, res) => {
    try {
        console.log({
            token:req.token,
            trackingID:req.transactionID
        })
        const transactionID = req.transactionID
        const response = await fetch(`https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=${transactionID}`,
        {
            headers: {
                "Authorization": `Bearer ${req.token}`
            },
            method: "GET",
            redirect: "follow"

        });

       
        const result = await response.text();
        console.log(result)
      } catch (error) {
        console.error(error);
      };
}

module.exports = {
    submitOrder,
    confirmPayment,
    getTransactionStatus
}
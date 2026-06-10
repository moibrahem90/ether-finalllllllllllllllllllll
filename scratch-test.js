const axios = require('axios');

(async () => {
  try {
    const prodRes = await axios.get('https://ether-backend-production-4013.up.railway.app/product');
    const validProductId = prodRes.data.data[0]._id;
    const res = await axios.post('https://ether-backend-production-4013.up.railway.app/order', {
      fullName: 'Test User',
      email: 'moibrahem881@gmail.com',
      phone: '+1 213-555-7812',
      instagramUsername: 'mostafa_ibrahem79',
      address: '123 Natural Way, Apt 4B, Irvine, CA 92612',
      products: [{ product: validProductId, quantity: 1 }],
      totalPrice: 32
    });
    console.log(res.data);
  } catch (err) {
    console.log("ERROR MESSAGE:", err.message);
    console.log("RESPONSE STATUS:", err.response?.status);
    console.log("RESPONSE DATA:", JSON.stringify(err.response?.data, null, 2));
  }
})();

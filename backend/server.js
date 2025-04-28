const express = require('express');
const Stripe = require('stripe');
const stripe = Stripe('your_stripe_secret_key');
const app = express();
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body; // amount in cents
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));

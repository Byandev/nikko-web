<template>
  <div id="dropin-container"></div>
  <button @click="submitPayment">Save Payment Method</button>
</template>

<script setup lang="ts">
import dropin, {type Dropin} from 'braintree-web-drop-in';
const { $api } = useNuxtApp();


const instance  = ref<Dropin | undefined>(undefined)
const token = ref<string>("")

onMounted(async () => {
  await fetchClientToken();
  await initializeDropIn();
})

const fetchClientToken = async () => {
 const response =  await $api<{data: string}>('/v1/payment/client-token')

  token.value = response.data
}

const  initializeDropIn = async() => {
  try {

    dropin.create(
        {
          authorization: token.value,
          container: '#dropin-container',
          paypal: {
            flow: 'checkout',
            amount: '10.00',
            currency: 'USD'
          }
        },
        (err, dropInInstance) => {
          if (err) throw err;
          instance.value = dropInInstance
        }
    );
  } catch (error) {
    console.error('Error initializing Drop-in:', error);
  }
}

const  submitPayment = async() => {
  try {
    const { nonce } = await instance.value?.requestPaymentMethod();
    // const response = await this.$axios.$post('/api/payment-method', {
    //   customerId: 'your-customer-id', // Replace with your customer's ID
    //   paymentMethodNonce: nonce,
    //   makeDefault: true, // Optional
    // });
    console.log('Payment Method Saved:', nonce);
  } catch (error) {
    console.error('Error saving payment method:', error);
  }
}

</script>

import { defineStore } from 'pinia'

interface PaymentMethod {
  name: string
  email: string
  card_number: string
  expiration_date: string
  cvc: string
}

export const usePaymentMethodStore = defineStore('cart', () => {
  const paymentMethod = ref<PaymentMethod>(
    {
      name: '',
      email: '',
      card_number: '',
      expiration_date: '',
      cvc: '',
    }
  )

  return {
    paymentMethod,
  }
})

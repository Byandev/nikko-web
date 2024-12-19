import { defineStore } from 'pinia'

interface PaymentMethod {
  name: string
  email: string
  expiration_date: string
  cvc: string
}

export const useCartStore = defineStore('cart', () => {
  const payment = ref<PaymentMethod>()

  return {
    payment,
  }
})

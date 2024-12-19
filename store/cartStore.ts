import { remove } from 'lodash'
import { defineStore } from 'pinia'

interface Cart {
  id: number
  name: string
  price: number
  imageSrc: string
  variant: string
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const cart = ref<Cart[]>([])

  const appendToCart = (item: Cart) => {
    console.log('item', item)
    cart.value.push(item)
  }

  const removeFromCart = (item: Cart) => { 
    remove(cart.value, i => i.id === item.id)
  }

  const subtotal = computed(() => {
    return cart.value.reduce((total, item) => total + item.price * item.quantity, 0)
  })

  const updateQuantity = (item: Cart, quantity: number) => {
    const existingItem = cart.value.find(i => i.id === item.id)
    if (existingItem) {
      existingItem.quantity = quantity
    }
  }

  return {
    cart,
    appendToCart,
    removeFromCart,
    updateQuantity,
    subtotal
  }
})

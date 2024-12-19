import { remove } from 'lodash'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const cart = ref<any[]>([])

  const appendToCart = (item: any) => {
    console.log('item', item)
    cart.value.push(item)
  }

  const removeFromCart = (item: any) => { 
    remove(cart.value, i => i.id === item.id)
  }

  return {
    cart,
    appendToCart,
    removeFromCart
  }
})

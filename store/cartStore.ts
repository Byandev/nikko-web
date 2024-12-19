import { remove } from 'lodash'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const cart = ref<any[]>([])

  const appendToCart = (item: any) => {
    console.log('item', item)
    cart.value.push(item)
  }

  const removeFromCart = (item: any) => { 
    console.log(item.id)
    remove(cart.value, i => i.id === item.id)
  }

  const subtotal = computed(() => {
    return cart.value.reduce((total, item) => total + item.price, 0)
  })

  return {
    cart,
    appendToCart,
    removeFromCart,
    subtotal
  }
})

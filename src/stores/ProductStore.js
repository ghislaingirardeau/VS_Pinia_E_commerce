import { defineStore } from 'pinia';
export const useProductStore = defineStore('ProductStore', {
  state: () => {
    return {
      products: [],
    };
  },
  actions: {
    // SIMULATION TO GET DATA AND FILL FROM API
    async fill() {
      this.products = (await import('@/data/products.json')).default;
    },
  },
  // getters
});

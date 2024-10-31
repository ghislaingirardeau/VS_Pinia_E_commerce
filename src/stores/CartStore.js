import { defineStore, acceptHMRUpdate } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { groupBy } from 'lodash';
import { useAuthUserStore } from '@/stores/AuthUserStore';
export const useCartStore = defineStore('CartStore', {
  historyEnabled: true, // pour signifier au plugins que seul ce store va renvoyer les fonctions undo et redo
  state: () => {
    return {
      items: useLocalStorage('CartStore:items', []),
      test: 'hello world',
    };
  },
  getters: {
    count: (state) => state.items.length,
    isEmpty: (state) => state.count === 0,
    grouped: (state) => {
      const grouped = groupBy(state.items, (item) => item.name);
      console.log(grouped);
      const sorted = Object.keys(grouped).sort();
      console.log(sorted);
      let inOrder = {};
      sorted.forEach((key) => (inOrder[key] = grouped[key]));
      console.log(inOrder);
      return inOrder;
    },
    groupCount: (state) => (name) => state.grouped[name].length,
    total: (state) => state.items.reduce((p, c) => p + c.price, 0),
  },
  actions: {
    checkout() {
      const authUserStore = useAuthUserStore();
      alert(
        `${authUserStore.username} just bought ${this.count} items at a total of $${this.total}`
      );
    },
    addItems(count, item) {
      count = parseInt(count);
      for (let index = 0; index < count; index++) {
        this.items.push({ ...item });
      }
    },
    clearItem(itemName) {
      this.items = this.items.filter((item) => item.name !== itemName);
    },
    setItemCount(item, count) {
      this.clearItem(item.name);
      this.addItems(count, item);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}

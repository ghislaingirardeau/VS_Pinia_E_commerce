# Pinia

## Pourquoi ?

Pour gérer les états de nos variables dans toute l'application

- Quand je navigue d'une page à une autre, les variables définis dans le composant se remette à 0 => le component est détruit puis recréer => donc pas pratique car on perd les données
- Vue utilise le système de composant et un composant peut avoir une multitude d'enfant, si je veux accéder à une variable u peu partout dans l'app

**demo**

## Installation

npm install pinia

dans main.ts

```js
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.mount('#app');
```

### Créer les fichiers dans stores

Créer un dossier "stores"
pour chaque store, on créée un fichier js

```js
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  // Mot clé pour définir la variable (comme constante)
  state: () => ({ count: 0, name: 'Eduardo' }),
  // getter = équivalent à computed
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  // equivalent à une fonction
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

OU

```JS
// but it's best to use the name of the store and surround it with `use`
// the first argument is a unique id of the store across your application
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const name = ref('Eduardo')
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, name, doubleCount, increment }
})
```

Unlike getters, actions can be asynchronous, you can await inside of actions any API call or even other actions

### Pour appeler le store dans un component

```js
import { useCounterStore } from '@/stores/Counter.js';
const store = useCounterStore();
```

#### Destructuring store

On peut utiliser la destructuration pour récupérer un seul element du store.
Il faut toutefois utiliser la méthode `storeToRefs` pour que celle-ci reste réactive au changement

```js
import { useCounterStore } from '@/stores/counter';
import { storeToRefs } from 'pinia';

const store = useCounterStore();
const { name, doubleCount } = storeToRefs(store);
// the increment action can just be destructured
const { increment } = store;
```

#### Local data VS global data

Uitiliser des data locales quand:

- elle est lié au component lui-même et son contexte
- Besoin sur un event spécifique ou lier à un seul parent
- aucun des autres component n'en a besoin

### Actions

Pour éviter de muter directement le state via le component

**Permet d'avoir plus d'actions sur comment le state va changer**, on peut notamment destrucuter l'objet 'item' pour ne pas qu'il soit "lier ou égale"
grace à ...item, celui ci sera indépendant dans le state au lieu d'etre egale.

```js
addItems(count, item) {
      count = parseInt(count);
      for (let index = 0; index < count; index++) {
        this.items.push({ ...item });
      }
    },
```

#### Reseting the state

Dans le store, créer une action qui va remettre le store à 0

### Store methods (option API seulement)

#### $patch

Pour faire un changement sur le state depuis le component (sans passer par action)

```js
cartStore.$patch((state) => {
  state.card.push(items);
});
```

**Mais plutot utiliser actions: code plus facile à lire et mutation à rassembler dans une meme action**

#### $reset

permet de réinitialiser le store a son état d'origine. Dispo seulement en option API

```js
cardStore.$reset();
```

### Getters

Créer un getter dans le store pour récupérer le nombre total de produit dans le panier puis l'envoyer au cart widget
Puis afficher un message avec ce meme getter que le cart est empty si pas d'article

### Use other store inside store

Comme dans un component, import le store, declare use... et on l'utilise

## Advanced

Pour eviter d'avoir à faire un refresh du browser à chaque fois que je travaille sur le store, on peut ajouter un module Hot reload
https://pinia.vuejs.org/cookbook/hot-module-replacement.html

```js
import { defineStore, acceptHMRUpdate } from 'pinia';
// dans le fichier cartStore
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
```

## Exo

### Créer le store Product

Créer le productstore:

- Charger le store en simulant un call API
- appeler le store dans le component et l'utiliser pour faire le rendu des card

### Créer le store Cart

Créer le cartStore:

- state => items [] : ajoute un item à chaque click de add to cart
- action => addItem: qui alimente le state
- dans le component :
  - productCart: emit addToCart envoie la quantité
  - app.vue: ajoute event addToCart dans <ProductCard> pour appeler cartStore.addItem, il faut alors importer cartStore également

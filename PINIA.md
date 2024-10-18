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

```js
import { useCounterStore } from '@/stores/counter';
import { storeToRefs } from 'pinia';

const store = useCounterStore();
const { name, doubleCount } = storeToRefs(store);
// the increment action can just be destructured
const { increment } = store;
```

#### Reseting the state

Dans le store, créer une action qui va remettre le store à 0

## Exo

### Utiliser datas dans le store plutot que fetch dans destination views

### Travel App: rendre notre site comme un site e-commerce

Création de la fonctionnalité poru ajouter un voyage au panier

- création du store: cardStore
- ensemble ajout des boutons add travel pour alimenter le card store

Gestion des routes, plus besoin de rappeler les données sur chaque route, on peut utiliser le store !

### En semi autonomie

- reset input quand add travel
- verifie que le voyage n'est pas deja ajouter

- ajouter une route vers le panier
- ajouter dans navigation un lien vers le panier + nombre qui affiche le total dans le panier
- montrer le détail de panier
- afficher le total du panier
- faire un reset du panier
- modifier le panier

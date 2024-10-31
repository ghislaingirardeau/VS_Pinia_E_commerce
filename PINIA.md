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

#### Accès au store

On peut accéder à toutes les propriétés du store importé dans le component grace à $state

On pourrait alors réinitialiser les propriétés du store

```js
const store = useCounterStore();
console.log(store.$state)
store.$state = {nouvelle objet qui va remplacer tout le state}
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

**/!\ ne fonctionnera pas avec uselocalstorage**

### Getters

Créer un getter dans le store pour récupérer le nombre total de produit dans le panier puis l'envoyer au cart widget
Puis afficher un message avec ce meme getter que le cart est empty si pas d'article

### Use other store inside store

Comme dans un component, import le store, declare use... et on l'utilise

## Advanced

### Hot module reload

Pour eviter d'avoir à faire un refresh du browser à chaque fois que je travaille sur le store, on peut ajouter un module Hot reload
https://pinia.vuejs.org/cookbook/hot-module-replacement.html

```js
import { defineStore, acceptHMRUpdate } from 'pinia';
// dans le fichier cartStore
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot));
}
```

### Subscribe Action = watch

permet de watch une action ou un state quand celui-ci est executer dans le store **equivalent à un watcher**

Pour une action

```js
// Utilise la méthode onAction du store dans le component
cartStore.$onAction(
  ({
    name, // nom de l'action dans le store à cibler
    store, // le state
    args, // les parametres envoyés à l'action
    after, // la fonction éxécuter une fois que l'action est éxécuté dans sa totalité
    onError, // si il y a une erreur dans l'action du store, on peut aussi la récupérer
  }) => {
    if (name === 'addItems') {
      after((result) => {
        // si l'action renvoie une promesse ou quelque chose, on peut récup le retour => se sera l'argument "result"
        console.log(args[0]);
      });
      onError((error) => {
        console.log('Hello error: ', error.message);
      });
    }
  }
);
```

### Subscribe State = watch / pour gérer un historique de state par exemple

On peut aussi ajouter un watcher sur le state, à chaque fois qu'une donnée est changer à l'intérieur execute une callback

**Cela peut etre utilise si on veut retourner à certain états du state: exemple avec une fonction de undo/redo**

l'idée est d'avoir un historique des différents enregistrement dans le state (par exemple ajout de produit dans un panier). Au clique sur un "undo", le state reviendrait à son état précédent.

```js
const history = reactive([])
const cartStore = useCartStore();
const doingHistory = ref(false)

cardStore.$subscribe(
  (
    mutation, // parametre qui decrit la mutation
    state // parametre qui renvoie tout le state
  ) => {
    // Attends que la MAJ de history soit terminer avant de faire le push
    if(!doingHistory.value) {
      history.push(JSON.stringify(state))
    }
  }
);

undo() {
  // ne va pas plus loin dans le undo, si history n'a qu'une seule valeur
  if(history.length === 1) return
  // est en train d'enregistrer l'histo
  doingHistory.value = true

  // retire le dernier etat du state
  history.pop()
  // réinitialise le state à l'history -1
  cardStore.$state = JSON.parse(history.at(-1))
  doingHistory.value = false

}
```

### Pinia custom plugins (exemple avec undo et redo)

Dans le dossier plugins, créer le fichier qui va nous servir de plugins et qui sera une fonction à exporter

Pour utiliser le plugins: dans `main.js`

```js
import { PiniaHistoryPlugin } from '@/plugins/PiniaHistoryPlugin';

const pinia = createPinia();
pinia.use(PiniaHistoryPlugin);
```

### Local storage = vue use

```js
import { useLocalStorage } from '@vueuse/core';

items: useLocalStorage('CartStore:items', []),
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

### Trie pour afficher un panier E-commerce

Chaque produit est ajouter dans notre tableau, ce même si le produit est déjà présent. Or pourquoi ne pas ajouter une quantité à ce produit
directement dans l'objet ?

**Parce que souvent les produits ont une taille, une couleur...**

Idée: on ajoute tous les produits un par un, mais on utilisera un getter pour afficher le rendu pour groupe de produit (ici par nom)

Lodash fournit une méthode très pratique pour grouper une liste de produit par nom => `grouBy`:

```js
const grouped = groupBy(state.items, (item) => item.name);
// renvoie un objet dont chaque propriété sera la clé servant à grouper (name)
// chaque propriété sera un array, contenant les items groupé
```

### Widget

Créer un widget au niveau de l'icone panier pour faire un rendu de la quantité totale d'article dans le panier

### Reset du store & supprimer un produit

Dans le card, ajouter la fonction pour vider le panier (utiliser $reset)

Ajouter les fonctions pour supprimer un produit

### Fonction Undo puis Redo

_En 2 parties: 1-dans le component 2-dans un plugins dédié_

Ajouter un bouton undo
Ajouter un watcher sur le state (subscribe):
Créer une variable history qui sera un array (qui contiendra un item à chaque changement du state)

subscribe => dans la callback, a chaque fois que le state va changer, la fonction fera un push dans history

Créer la fonction "undo" et son bouton

undo => si history est de 1 return sinon tu supprimes le dernier élément du tableau et tu réinitialise le state
du dernier element du array `history` => ($state)

Redo idem
Ajouter un bouton undo
Créer une variable future qui sera un array (qui contiendra un item à chaque changement du state)

Quand je clique sur undo => le dernier element de history sera push dans future

Créer la fonction "redo" et son bouton

- extrait le dernier element de redo
- si pas d'element, tu ne fais rien
- push cet element dans history (pour refaire le undo si besoin)
- réinitialise le state avec ce dernier element

**bug si on ajoute un nouveau element dans le panier**

- dans la callback de subscribe => doit retirer de future le dernier element du tableau

#### correction

```js
const history = reactive([])
const futur = reactive([])

const cartStore = useCartStore();
const doingHistory = ref(false)

cardStore.$subscribe(
  (
    mutation, // parametre qui decrit la mutation
    state // parametre qui renvoie tout le state
  ) => {
    // Attends que la MAJ de history soit terminer avant de faire le push
    if(!doingHistory.value) {
      // ajoute dans hitorique
      history.push(JSON.stringify(state))
      // retire de futur (pour qu'il soit vide)
      futur.splice(0, futur.length)
    }
  }
);

undo() => {
  // ne va pas plus loin dans le undo, si history n'a qu'une seule valeur
  if(history.length === 1) return
  // est en train d'enregistrer l'histo
  doingHistory.value = true
  // retire le dernier etat du state history, mais ajout dans le futur (si redo)
  futur.push(history.pop())

  // réinitialise le state à l'history -1
  cardStore.$state = JSON.parse(history.at(-1))
  doingHistory.value = false

}

redo() => {
  const lastest = futur.pop()
  if(!lastest) return

  history.push(lastest)
  cardStore.$state = JSON.parse(lastest)

}
```

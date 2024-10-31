import { ref, reactive } from 'vue';
export function PiniaHistoryPlugin({
  pinia,
  app,
  store, // fait reférence au store sur lequel sera utilisé le plugins (ex: cardStore.undo).
  // Le retour du plugins sera alors utilisable dans tous les stores. On peut couper ce comportement grace à options
  options, // donnée hors state, mutation, getter que l'on peut récupérer des stores
}) {
  if (!options.historyEnabled) return; // pour éviter le fait que ce plugins est utilisable par tous les stores (donc tous nos fichiers)
  // on passe dans le store de cardStore, historyEnabled=true. Du coups, le plugins ne renverra rien à ProductStore ni AuthUserStore
  const history = reactive([]);
  const future = reactive([]);
  const doingHistory = ref(false);
  history.push(JSON.stringify(store.$state));

  store.$subscribe((mutation, state) => {
    if (!doingHistory.value) {
      history.push(JSON.stringify(state));
      future.splice(0, future.length);
    }
  });
  return {
    // tout ce qui a dans le return sera disponible dans le store et donc pourra etre appelé du component
    history,
    future,
    undo: () => {
      if (history.length === 1) return;
      doingHistory.value = true;
      future.push(history.pop());
      store.$state = JSON.parse(history.at(-1));
      doingHistory.value = false;
    },
    redo: () => {
      const latestState = future.pop();
      if (!latestState) return;
      doingHistory.value = true;
      history.push(latestState);
      store.$state = JSON.parse(latestState);
      doingHistory.value = false;
    },
  };
}

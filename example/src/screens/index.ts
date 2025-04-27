export const screens = [
  {
    name: 'Dynamic Snap Point',
    slug: 'Modal/DynamicSnapPointExample',
    getScreen: () => require('./modal/DynamicSnapPointExample').default,
  },
  {
    name: 'Detached',
    slug: 'Modal/DetachedExample',
    getScreen: () => require('./modal/DetachedExample').default,
  },
  {
    name: 'Simple',
    slug: 'Modal/DetachedExample2',
    getScreen: () => require('./modal/SimpleExample').SimpleExample,
  },
  {
    name: 'LoaderExample',
    slug: 'Modal/LoaderExample',
    getScreen: () => require('./modal/LoaderExample').LoaderExample,
  },
  {
    name: 'ListExample',
    slug: 'Modal/ListExample3',
    getScreen: () => require('./modal/ListExample').default,
  },
  {
    name: 'List2Example',
    slug: 'Modal/List2Example',
    getScreen: () => require('./modal/List2Example').List2Example,
  },
  {
    name: 'KeyboardExample',
    slug: 'Modal/KeyboardExample',
    getScreen: () => require('./modal/KeyboardExample').default,
  },
  {
    name: 'Keyboard2Example',
    slug: 'Modal/Keyboard2Example',
    getScreen: () => require('./modal/Keyboard2Example').default,
  },
  {
    name: 'PropsExample',
    slug: 'Modal/PropsExample',
    getScreen: () => require('./modal/PropsExample').PropsExample,
  },
  {
    name: 'QueueExample',
    slug: 'Modal/QueueExample',
    getScreen: () => require('./modal/QueueExample').QueueExample,
  },
  {
    name: 'DismissPreventExample',
    slug: 'Modal/DismissPreventExample',
    getScreen: () =>
      require('./modal/DismissPreventExample').DismissPreventExample,
  },
];

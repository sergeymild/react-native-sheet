export const screens = [
  {
    title: 'Modal',
    data: [
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
        name: 'ListDynamicExample',
        slug: 'Modal/ListDynamicExample',
        getScreen: () =>
          require('./modal/ListDynamicExample').ListDynamicExample,
      },
      {
        name: 'KeyboardExample',
        slug: 'Modal/KeyboardExample',
        getScreen: () => require('./modal/KeyboardExample').default,
      },
      {
        name: 'RequireExample',
        slug: 'Modal/RequireExample',

        getScreen: () => require('./modal/RequireExample').RequireExample,
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
        name: 'Queue2Example',
        slug: 'Modal/Queue2Example',
        getScreen: () => require('./modal/Queue2Example').Queue2Example,
      },
      {
        name: 'TopModalExample',
        slug: 'Modal/TopModalExample',
        getScreen: () => require('./modal/TopModalExample').TopModalExample,
      },
      {
        name: 'DismissPreventExample',
        slug: 'Modal/DismissPreventExample',
        getScreen: () =>
          require('./modal/DismissPreventExample').DismissPreventExample,
      },
    ],
  },
];

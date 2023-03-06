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
        name: 'KeyboardExample',
        slug: 'Modal/KeyboardExample',
        getScreen: () => require('./modal/KeyboardExample').default,
      },
    ],
  },
];

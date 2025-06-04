import { LoaderExample } from './modal/LoaderExample';
import ListExample from './modal/ListExample';
import { List2Example } from './modal/List2Example';
import KeyboardExample from './modal/KeyboardExample';
import { Keyboard2Example } from './modal/Keyboard2Example';
import { PropsExample } from './modal/PropsExample';
import { QueueExample } from './modal/QueueExample';
import { DismissPreventExample } from './modal/DismissPreventExample';
import DetachedExample from './modal/DetachedExample';
import DynamicSnapPointExample from './modal/DynamicSnapPointExample';
import { DismissAllExample } from './modal/DismissAllExample';
import { DismissPresentedExample } from './modal/DismissPresentedExample';
import { Keyboard3Example } from './modal/Keyboard3Example';
import { NamedExample } from './modal/NamedExample';

export const screens = [
  {
    name: 'Dynamic Snap Point',
    slug: 'Modal/DynamicSnapPointExample',
    getScreen: () => DynamicSnapPointExample,
  },
  {
    name: 'Dismiss all',
    slug: 'Modal/DismissAllExample',
    getScreen: () => DismissAllExample,
  },
  {
    name: 'Dismiss presented',
    slug: 'Modal/DismissPresentedExample',
    getScreen: () => DismissPresentedExample,
  },
  {
    name: 'Detached',
    slug: 'Modal/DetachedExample',
    getScreen: () => DetachedExample,
  },
  {
    name: 'LoaderExample',
    slug: 'Modal/LoaderExample',
    getScreen: () => LoaderExample,
  },
  {
    name: 'NamedExample',
    slug: 'Modal/NamedExample',
    getScreen: () => NamedExample,
  },
  {
    name: 'ListExample',
    slug: 'Modal/ListExample3',
    getScreen: () => ListExample,
  },
  {
    name: 'List2Example',
    slug: 'Modal/List2Example',
    getScreen: () => List2Example,
  },
  {
    name: 'KeyboardExample',
    slug: 'Modal/KeyboardExample',
    getScreen: () => KeyboardExample,
  },
  {
    name: 'Keyboard2Example',
    slug: 'Modal/Keyboard2Example',
    getScreen: () => Keyboard2Example,
  },
  {
    name: 'Keyboard3Example',
    slug: 'Modal/Keyboard3Example',
    getScreen: () => Keyboard3Example,
  },
  {
    name: 'PropsExample',
    slug: 'Modal/PropsExample',
    getScreen: () => PropsExample,
  },
  {
    name: 'QueueExample',
    slug: 'Modal/QueueExample',
    getScreen: () => QueueExample,
  },
  {
    name: 'DismissPreventExample',
    slug: 'Modal/DismissPreventExample',
    getScreen: () => DismissPreventExample,
  },
];

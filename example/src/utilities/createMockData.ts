// @ts-ignore
import Faker from 'faker';
import type { Contact } from './types';

export const createContactListMockData = (count: number = 20): Contact[] => {
  return new Array(count).fill(0).map(() => ({
    name: `${Faker.name.firstName()} ${Faker.name.lastName()}`,
    address: `${Faker.address.city()}, ${Faker.address.country()}`,
    jobTitle: Faker.name.jobTitle(),
  }));
};

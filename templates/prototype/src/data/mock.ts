export interface SampleItem {
  id: string;
  title: string;
  status: string;
}

/** Replace with entities from docs/requirements.md */
export const sampleItems: SampleItem[] = [
  { id: '1', title: 'Пример записи 1', status: 'active' },
  { id: '2', title: 'Пример записи 2', status: 'pending' },
  { id: '3', title: 'Пример записи 3', status: 'done' },
];

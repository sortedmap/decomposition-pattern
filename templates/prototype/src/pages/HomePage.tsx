import { sampleItems } from '../data/mock';

export function HomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Главная</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Пример данных</h2>
        <ul className="divide-y divide-gray-100">
          {sampleItems.map((item) => (
            <li key={item.id} className="py-3 flex justify-between">
              <span>{item.title}</span>
              <span className="text-gray-500 text-sm">{item.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

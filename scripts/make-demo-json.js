import { writeFile } from 'node:fs/promises';
import { faker } from '@faker-js/faker';

const rows = [];
for (let id = 1; id < 100000; id++) {
  rows.push({
    id,
    icon: faker.internet.emoji(),
    fileName: faker.system.commonFileName().split('.')[0],
    fileType: faker.system.commonFileExt(),
    fileSize: faker.number.int({ min: 1e2, max: 1e5 }),
    createTimeMs: faker.date.between({
      from: Date.now() - 864e5 * 90,
      to: Date.now() - 864e5 * 60,
    }),
    updateTimeMs: faker.date.between({ from: Date.now() - 864e5 * 30, to: Date.now() }),
    directoryPath: faker.system.directoryPath(),
  });
}
const fileName = 'demo/public/demo.json';
await writeFile(fileName, JSON.stringify(rows));

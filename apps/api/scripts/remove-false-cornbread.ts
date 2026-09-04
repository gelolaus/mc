import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { removeFalseCornbread } from '../src/remove-false-cornbread';

const db = new PrismaClient();

removeFalseCornbread(db)
  .then((result) => {
    console.log(result === 'removed'
      ? 'Removed the unchanged false Cornbread2100_ record.'
      : 'Preserved Cornbread2100_: the record is absent or has activity beyond the known failed connection.');
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

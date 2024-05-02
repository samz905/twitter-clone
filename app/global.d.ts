import { Database as DB } from '@/app/global';

declare global {
    type Database = DB;
}



import Dexie, { Table } from 'dexie'
import { StoredFile } from './definitions'

class FileDatabase extends Dexie {
    files!: Table<StoredFile, number>

    constructor() {
        super('FileDatabase')
        this.version(1).stores({
            files: '++id, name, type, size'
        })
    }
}

export { FileDatabase }
import admZip from 'adm-zip';
import fs from 'fs';

export class FolderManager {
    private folder: string;

    constructor(folder: string) {
        this.folder = folder;
    }

    public zipFolder(): Buffer {
        const zip: admZip = new admZip();
        zip.addLocalFolder(this.folder);
        return zip.toBuffer();
    }

    public removeFolder() {
        fs.rmSync(this.folder, { recursive: true, force: true });
    }
}
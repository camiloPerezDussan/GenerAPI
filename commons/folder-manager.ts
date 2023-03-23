import Scaffold from 'scaffold-generator';
import mustache from 'mustache';
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

    public replaceData(data, origin: string, target: string) {
        return new Promise((resolve, reject) => {
            new Scaffold({
                data,
                render: mustache.render,
                backup: false,
                override: false
            }).copy(origin, target)
                .then((res) => resolve(res))
                .catch((err: Error) => reject(err));

            //fs.mkdirSync(`${this.mainPath}/java/${this.appPackage}/${this.appName.toLowerCase()}/application/${this.version}`, { recursive: true })
            //fs.mkdirSync(`${this.mainPath}/resources`, { recursive: true })
        });
    }
}
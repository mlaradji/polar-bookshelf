
import {app, remote} from 'electron';
import path from 'path';
import fs from 'fs';
import {isPresent} from '../../Preconditions';

const USE_FILE_URL = true;

/**
 * Given a relative path, return a full path to a local app resource.
 *
 * Each module has a unique __dirname so with this mechanism we can reliably
 * find an path to a file as if we were in the root of the webapp.
 *
 */
export class AppPaths {

    public static relative(relativePath: string) {

        // TODO: sometimes appPath is an ASAR file and that really confuses
        // us and we're going to need a strategy to handle that situation.

        const baseDirs = AppPaths.getBaseDirs();

        for (let i = 0; i < baseDirs.length; i++) {
            const baseDir = baseDirs[i];

            const absolutePath = path.resolve(baseDir, relativePath);

            try {

                // We use readFileSync here because we need to we need to peek into
                // .asar files which do not support exists but DO support reading
                // the file.  If this fails we will get an exception about not
                // finding the file.

                fs.readFileSync(absolutePath);
                return absolutePath;

            } catch (e) {
                // we know this happens because I can't tests for file exists
                // since .asar files have to be read to check for existence.
            }

        }

        throw new Error(`No file found for ${relativePath} in baseDirs: ` + JSON.stringify(baseDirs));

    }

    /**
     * Get the basedir of the current webapp.
     */
    protected static getBaseDirs(): string[] {

        let baseDirs: string[] = [];

        if(! isPresent(app)) {
            baseDirs.push(remote.app.getAppPath());
        } else {
            baseDirs.push(app.getAppPath());
        }

        baseDirs.push(process.cwd());

        return baseDirs;

    }

    /**
     * Build a full resource URL from a given relative URL.
     *
     * @param relativeURI
     */
    static resource(relativeURI: string): string {

        let relativePath = relativeURI;
        let queryData = "";

        if (relativeURI.indexOf("?") !== -1) {
            relativePath = relativeURI.substring(0, relativeURI.indexOf("?"));
            queryData = relativeURI.substring(relativeURI.indexOf("?"));
        }

        if(USE_FILE_URL) {

            const path = AppPaths.relative(relativePath);

            return 'file://' + path + queryData;

        } else {
            // return 'http://localapp.getpolarized.io:8500' + relativePath + queryData;
            // return 'http://example.com'
            return "http://localapp.getpolarized.io:8500/apps/repository/index.html";
        }

    }

}

export class AppPathException extends Error {

}

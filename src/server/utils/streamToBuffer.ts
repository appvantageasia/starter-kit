import { Readable } from 'stream';
import BufferListStream from 'bl';

export const streamToBuffer = (stream: Readable): Promise<Buffer> =>
    new Promise((resolve, reject) => {
        stream.pipe(
            new BufferListStream((error, buffer) => {
                if (error) {
                    reject(error);

                    return;
                }

                resolve(buffer);
            })
        );
    });

export default streamToBuffer;

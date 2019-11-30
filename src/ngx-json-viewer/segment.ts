export interface Segment {
    key: string;
    value: any;
    type: undefined | string;
    description: string;
    expanded: boolean;
}

// Inspiration from https://stackoverflow.com/a/46461300/4544386
// Tackles the problem of cyclical objects.
export const isCyclic = (segment: Segment) : { cyclic: boolean, err: string } => {
    let keys: string[] = [], stack: string[] = [];
    let cyclic: boolean = false;
    let err: string = "";

    const detect = (obj: any, key: string) => {
        if (typeof obj !== 'object') {
            return;
        }

        if (stack.indexOf(obj) > -1) { // it's cyclic! Print the object and its locations.
            const oldIndex = stack.indexOf(obj);
            const l1 = keys.join('.') + '.' + key;
            const l2 = keys.slice(0, oldIndex + 1).join('.');
            err = '[Cyclic at: ' + l1 + ' = ' + l2 + ']';
            cyclic = true;
            return;
        } else {
            keys.push(key);
            stack.push(obj);
            for (const k in obj) { // dive on the object's children
                if (obj.hasOwnProperty(k)) {
                    detect(obj[k], k);
                }
            }
            keys.pop();
            stack.pop();
        }
    };

    detect(segment.value, segment.key);
    return { cyclic, err };
};

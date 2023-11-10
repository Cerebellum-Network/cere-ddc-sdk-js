import {useClient} from './useClient';

export const Playground = () => {
    const client = useClient();

    if (!client) {
        return <div>Initializing...</div>;
    }

    return <div>Hello DDC Client playground</div>;
};

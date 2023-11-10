import {DEVNET, DdcClient} from '@cere-ddc-sdk/ddc-client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {USER_SEED} from './constants';

export const Playground = () => {
    const [client, setClient] = useState<DdcClient>();

    useEffect(() => {
        DdcClient.create(USER_SEED, DEVNET).then(setClient);
    }, []);

    if (!client) {
        return <div>Initializing...</div>;
    }

    return <div>Hello DDC Client playground</div>;
};

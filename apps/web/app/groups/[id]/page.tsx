'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function GroupIndex() {
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        router.replace(`/groups/${params.id}/books`);
    }, [params.id, router]);

    return null;
}

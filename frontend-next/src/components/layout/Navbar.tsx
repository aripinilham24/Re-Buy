'use client';

import { useAuthStore } from '@/src/store/auth.store.js';

export default function Navbar() {
   const user = useAuthStore((s) => s.user);

   return (
    <nav>
        {user ? <span>Hello, {user.username}</span> : <span>Guest</span>}
    </nav>
   )
}
interface formRegis {
    username: string;
    email: string;
    password: string;
}

interface formLogin {
    email: string;
    password: string;
}

export type FormLogin = formLogin;

export type FormRegister = formRegis;
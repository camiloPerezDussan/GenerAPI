interface Cors {
    origin: string;
    methods: string;
}

export const corsOptions: Cors = {
    origin: 'http://localhost',
    methods: 'POST, GET'
}
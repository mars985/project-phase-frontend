export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    imageUrl?: string;
}

export interface Chat {
    id: string | null;
    title: string;
    messages: Message[];
    preview: string;
}

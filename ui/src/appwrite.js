import { Client, Databases, Account } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('698891ce002bd0696e1b'); // Your Project ID from .env

export const databases = new Databases(client);
export const account = new Account(client);
export { client };

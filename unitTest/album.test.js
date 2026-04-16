import request from 'supertest';
import mongoose from 'mongoose';
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import app from '../app.js'; 
import Album from '../models/albumModel.js';
const testAlbums = [
    { artist: "Artist A", title: "Album 1", year: 2020, genre: "Rock", tracks: 10 },
    { artist: "Artist B", title: "Album 2", year: 2021, genre: "Pop", tracks: 12 }
];

beforeAll(async () => {
    const url = process.env.MONGO_URI_TEST; 
    await mongoose.connect(url);
});

beforeEach(async () => {
    await Album.deleteMany({});
    await Album.insertMany(testAlbums);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('GET /api/albums', () => {
    it('should return the exact number of albums in the test database', async () => {
        const response = await request(app).get('/api/albums');

        expect(response.statusCode).toBe(200);
        
        expect(response.body.length).toBe(testAlbums.length);
    });
});

describe('POST /api/albums', () => {
    it('should create a new album and increase the total count', async () => {
    const newAlbum = {
        artist: "Radiohead",
        title: "Computer",
        year: 1997,
        genre: "Rock",
        tracks: 12
    };

    const response = await request(app)
        .post('/api/albums')
        .send(newAlbum);

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(newAlbum.title);

    const finalCount = await Album.countDocuments();
    expect(finalCount).toBe(testAlbums.length + 1); 
});
});
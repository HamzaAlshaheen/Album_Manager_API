import Album from '../models/albumModel.js';

export const renderAlbums = async (req, res) => {
    const albums = await Album.find();
    res.render('albums', { albums, user: req.user });
};

export const renderAddForm = (req, res) => {
    res.render('add-album', { user: req.user });
};

export const createAlbum = async (req, res) => {
    const newAlbum = await Album.create(req.body);
    res.render('album', {
        user:req.user,
        album: newAlbum
    });
};


export const testingApi =  async (req, res) => {
    try {
        const albums = await Album.find();
        res.status(200).json(albums); 
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch albums" });
    }
};

export const PostTest = async (req, res) => {
    try {
        const album = new Album(req.body);
        await album.save();
        res.status(201).json(album); 
    } catch (err) {
        
        res.status(400).json({ error: "Could not create album" });
    }
}
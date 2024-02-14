const express = require('express')
const PORT = process.env.PORT || 8000;
const {MongoClient} = require('mongodb');

// const articlesInfo = {
//     "learn-react": {
//         comments: [],
//     },
//     "learn-node": {
//         comments: [],
//     },
//     "learn-advance-react": {
//         comments: [],
//     },
// }

const app = express();

//initialize middlware
//we have to install body parser but now it is a built in middleware
//function of express. It parses incomeing JSON payload
app.use(express.json({extended:false}));

const withDB = async (operations,res) =>{
    try{
        // const articleName = req.params.name;


        const client = await MongoClient.connect('mongodb+srv://jjakhu786:Blog@blog1.arig7dd.mongodb.net/?retryWrites=true&w=majority')
        const db = client.db('mernblog');
        // const articleInfo = await db.collection('articles').findOne({name: articleName});
        // res.status(200).json(articleInfo);

        await operations(db);
        client.close()
    }catch(err){
            res.status(500).json({message: "Error connecting to database",err});
    }
}
app.get('/', (req, res) => {
    res.send('welcome to my Application');
})

// app.post('/',(req, res) => {
//     res.send(`Hello ${req.body.name}`);
// })

//use params
// app.get('/hello/:name', (req, res) => {
//     res.send(`Hello ${req.params.name}`);
// })





app.get('/api/articles/:name', async (req, res) => {
    withDB(async (db) => {
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({name: articleName});
        res.status(200).json(articleInfo);
    },res)
    // const client = await MongoClient.connect('mongodb+srv://jjakhu786:Blog@blog1.arig7dd.mongodb.net/?retryWrites=true&w=majority')
    // const db = client.db('mernblog');
        // client.close()
    }
    // catch(err){
    //         res.status(500).json({message: "Error connecting to database",err});
    // }
);

app.post('/api/articles/:name/add-comments', (req, res) => {
    const articleName = req.params.name;
    const {username, text} = req.body;
    withDB(async (db) => {
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        
        await db.collection('articles').updateOne(
            {name: articleName},
            {
                $set:{
                    comments: articleInfo.comments.concat({username,text})
                 },
            }
            
        );
        const updateArticleInfo = await db.collection('articles').findOne({name: articleName})
        res.status(200).json(updateArticleInfo);
    },res);
    });

app.listen(PORT, () => {
    console.log('listening on port 8000')
})
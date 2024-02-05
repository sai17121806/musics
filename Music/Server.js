const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const app = express();
const database = "mongodb+srv://Sai5685:Sai568599@cluster.y3rescu.mongodb.net/MyDatabase?retryWrites=true&w=majority";

//Connection Database
mongoose.connect(database)
        .then((success) => {
                console.log("Database Connected");
                app.listen(5000);
                console.log("Server Listening on Port 5000");
        })
        .catch((error) => {
                console.log(error);
        });

//Collection Schema        
const data = mongoose.model("UserData", new mongoose.Schema({
        time:
        {
                type: String
        },
        id:
        {
                type: String
        }
}));

//Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static("./images"));


var options1 = {
        method: 'GET',
        url: 'https://spotify23.p.rapidapi.com/search/',
        params: {
                type: 'multi',
                offset: '0',
                limit: '10',
                numberOfTopResults: '10'
        },
        headers: {
                'X-RapidAPI-Key': '3ea7803d68msh1b4c174675b7d21p156524jsn0bb200d1a39d',
                'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
        }
};


var options2 = {
        method: 'GET',
        url: 'https://spotify23.p.rapidapi.com/tracks/',
        params: {
        },
        headers: {
                'X-RapidAPI-Key': '3ea7803d68msh1b4c174675b7d21p156524jsn0bb200d1a39d',
                'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
        }
};

app.get("/", (req, res) => {
        res.render("Home");
});

app.get("/current-playing", (req, res) => {
        res.render("Current");
});

app.get("/search", (req, res) => {
        res.render("Search");
})

app.post("/send", (req, res) => {
        var recentlyPlayedData = [];
        data.find({}).sort({ _id: -1 }).limit(10).then(async (yes) => {
                var Id = "";
                for (let i = 0; i <= 9; i++) {
                        Id += yes[i].id + ",";
                }
                options2.params.ids = Id;
                const response2 = await axios.request(options2);
                for (let i = 0; i <= 9; i++) {
                        options1.params.q = response2.data.tracks[i].name;
                        const response1 = await axios.request(options1);
                        recentlyPlayedData.push({ photo: response1.data.tracks.items[0].data.albumOfTrack.coverArt.sources[0].url, name: response1.data.tracks.items[0].data.name, });
                }
                res.set("content-type", "application/json");
                res.send(JSON.stringify(recentlyPlayedData));
        }).catch((no) => {
                console.log(no);
        })
})

var searchId;
app.post("/sendData", (req, res) => {
        req.on('data', async (chunk) => {
                try {
                        options1.params.q = chunk.toString();
                        const response1 = await axios.request(options1);
                        let songId = response1.data.tracks.items[0].data.id;
                        searchId = response1.data.tracks.items[0].data.id;
                        try {
                                options2.params.ids = songId;
                                const response2 = await axios.request(options2);
                                res.set("Content-Type", "application/json");
                                res.send(JSON.stringify({
                                        message: response2.data.tracks[0].preview_url,
                                        photo: response1.data.tracks.items[0].data.albumOfTrack.coverArt.sources[0].url,
                                        id: response1.data.tracks.items[0].data.id,
                                        name: response1.data.tracks.items[0].data.name,
                                        artist: response1.data.tracks.items[0].data.artists.items[0].profile.name
                                }));


                        } catch (error) {
                                console.error(error);
                        }
                } catch (error) {
                        console.error(error);
                }
        });

});

app.post("/sendDateTime", (req, res) => {
        req.on("data", (chunk) => {
                let Data = new data({ time: chunk.toString(), id: searchId });
                Data.save().then((yes) => {

                }).catch((no) => {
                        console.log(no);
                })
        })
});

app.post("/recentlyPlayed", (req, res) => {
        req.on("data", (chunk) => {
                if (chunk.toString() == 1) {
                        data.find({}).sort({ _id: -1 }).then(async (yes) => {
                                options2.params.ids = yes[0].id;
                                const response2 = await axios.request(options2);
                                options1.params.q = response2.data.tracks[0].name;
                                const response1 = await axios.request(options1);
                                res.set("Content-Type", "application/json");
                                res.send(JSON.stringify({
                                        message: response2.data.tracks[0].preview_url,
                                        photo: response1.data.tracks.items[0].data.albumOfTrack.coverArt.sources[0].url,
                                        id: response1.data.tracks.items[0].data.id,
                                        name: response1.data.tracks.items[0].data.name,
                                        artist: response1.data.tracks.items[0].data.artists.items[0].profile.name
                                }));
                        }).catch((no) => {
                                console.log(no);
                        })
                }
        })
})

app.use("/", (req, res) => {
        res.status(404).send("Invalid Page");
})
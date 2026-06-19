const dotenv = require('dotenv');
dotenv.config();

const url = 'https://api.themoviedb.org/3/movie/1367220?append_to_response=credits,reviews,videos,external_ids&language=en-US';

fetch(url, {
  headers: {
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);

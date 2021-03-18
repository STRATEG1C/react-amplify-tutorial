import './App.css';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import awsmobile from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { listSongs } from './graphql/queries';
import { useEffect, useState } from 'react';
import { IconButton, Paper } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FavoriteIcon from '@material-ui/icons/Favorite';

Amplify.configure(awsmobile);

function App() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const songData = await API.graphql(graphqlOperation(listSongs));
      const songList = songData.data.listSongs.items;
      console.log('Song list: ', songList);
      setSongs(songList);
    } catch (error) {
      console.log('error on fetching songs', error);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <AmplifySignOut />
        <h2>My App Content</h2>
      </header>
      <div className="song-list">
        { songs.map(song => {
          return (
            <Paper variant="outlined" elevation={2}>
              <div className="song-card">
                <IconButton aria-label="play">
                  <PlayArrowIcon />
                </IconButton>
                <div>
                  <div className="song-title">{song.title}</div>
                  <div className="song-owner">{song.owner}</div>
                </div>
                <div>
                  <IconButton aria-label="like">
                    <FavoriteIcon />
                  </IconButton>
                  {song.likes}
                </div>
                <div className="song-description">{song.description}</div>
              </div>
            </Paper>
          )
        }) }
      </div>
    </div>
  );
}

export default withAuthenticator(App);

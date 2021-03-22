import './App.css';
import Amplify, { API, graphqlOperation, Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { listSongs } from './graphql/queries';
import { updateSong } from './graphql/mutations';
import { useEffect, useState } from 'react';
import { IconButton, Paper } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PauseIcon from '@material-ui/icons/Pause';

Amplify.configure(awsmobile);

function App() {
  const [songs, setSongs] = useState([]);
  const [songPlaying, setSongPlaying] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(() => {
    fetchSongs();
  }, []);

  const toggleSong = async (idx) => {
    if (songPlaying === idx) {
      return setSongPlaying('');
    }

    const songFilePath = songs[idx].filePath;
    try {
      const fileAccessUrl = await Storage.get(songFilePath, { expires: 60 });
      console.log('Access url', fileAccessUrl);
      setSongPlaying(idx);
      setAudioUrl(fileAccessUrl.trim());
    } catch (error) {
      console.log('Error accessing file from s3', error);
      setAudioUrl('');
      setSongPlaying('');
    }
  }

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

  const addLike = async (idx) => {
    try {
      const song = songs[idx];
      song.likes = song.likes + 1;

      delete song.createdAt;
      delete song.updatedAt;

      const songData = await API.graphql(graphqlOperation(updateSong, { input: song }));

      const songList = [...songs];
      songList[idx] = songData.data.updateSong;
      setSongs(songList);
    } catch (error) {
      console.log('Error on adding like to song', error);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <AmplifySignOut />
        <h2>My App Content</h2>
      </header>
      <div className="song-list">
        { songs.map((song, idx) => {
          return (
            <Paper variant="outlined" elevation={2} key={`song-${idx}`}>
              <div className="song-card">
                <IconButton aria-label="play" onClick={() => toggleSong(idx)}>
                  { songPlaying === idx ? <PauseIcon /> : <PlayArrowIcon /> }
                </IconButton>
                <div>
                  <div className="song-title">{song.title}</div>
                  <div className="song-owner">{song.owner}</div>
                </div>
                <div>
                  <IconButton aria-label="like" onClick={() => addLike(idx)}>
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

import React, { Component } from 'react';
import SearchBar from '../SearchBar';
import VideoList from '../VideoList';
import InfiniteScroll from '../InfiniteScroll';
import Spinner from '../Spinner';
import youtubeAPI, { defaultParams } from '../../api/youtube';

import './index.css';
class App extends Component {


  constructor() {
    super();
    // initial app state
    this.state = {
      videos: [],
      nextPageToken: "",
      pageInfo: {},
      hasMore: null
    }
  }

  //gets Videos from searched keyword
  handleSearch = async (keyword) => {
    //fetches videos with searched keyword
    const videoResp = await youtubeAPI.get('/search', {
      params: {
        ...defaultParams,
        q: keyword
      }
    });
    
    this.setState({
      videos: videoResp.data.items,
      nextPageToken: videoResp.data.nextPageToken,
      pageInfo: videoResp.data.pageInfo,
      searchKeyword: keyword
    });
  }

  // fetches videos when user scrolls down to the bottom of the page
  handleEOPReach = async () => {
    const { searchKeyword, nextPageToken, videos, hasMore } = this.state;
    //if no more videos left to fetch 
    if (hasMore !== null && !hasMore) return;
    this.setState({ isLoading: true });
    const resp = await youtubeAPI.get('/search', {
      params: {
        ...defaultParams,
        q: searchKeyword,
        pageToken: nextPageToken
      }
    });
    // updating state with additonal videos loaded
    this.setState({
      videos: [...videos, ...resp.data.items],
      nextPageToken: resp.data.nextPageToken,
      hasMore: this.state.pageInfo.totalResults - videos.length > 0 ? true : false,
      isLoading: false
    });

  }

  render() {
    const { videos, hasMore, isLoading } = this.state;
    let progressStatus;
    //if user has reached the end of page and next set of video results are getting fetched show spinner at bottom
    if (hasMore && isLoading) {
      progressStatus = (<Spinner />);
    } else if (hasMore !== null && !hasMore) {
      progressStatus = (<p>That's it no more videos to show...</p>);
    }

    return (
      <div className="App" >
        <header className="App-header">
          <SearchBar handleSubmit={this.handleSearch} />
        </header>
        <VideoList videoData={videos} />
        <InfiniteScroll handleEOPReach={this.handleEOPReach} />
        {progressStatus}
      </div>
    );
  }

}

export default App;

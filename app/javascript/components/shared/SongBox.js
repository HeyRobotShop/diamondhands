import React from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import $ from "jquery";
import _ from "lodash";
import Tippy from "@tippyjs/react";
import artistUrl from "../util/artistUrl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPause,
  faPlay,
  faHeart,
  faRetweet,
  faComments,
} from "@fortawesome/free-solid-svg-icons";

const niceShadow = css`
  text-shadow: 1px 1px 2px #000000;
`;

const SongBoxWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 0px;
  margin-left: 0px;
  margin-right: 30px;
  position: relative;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0px 13px 13px -8px #dadada;
  // transform: scale(1, 1);
  // transition: transform 0.5s ease;

  // &:hover {
  // 	transform: scale(1.03, 1.03);
  // }

  @media all and (max-width: 800px) {
    margin: ${(props) => (props.showRank ? "0 0 20px 30px" : "0")};
  }
`;

const SongImg = styled.div`
  height: 100px;
  width: 180px;
  transition: width 1.2s ease;
  ${(props) => props.src && `background-image: url(${props.src});`};
  background-size: cover;
`;

const BottomLeft = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  z-index: 100;
`;

const TopRight = styled(Link)`
  position: absolute;
  top: 0;
  right: 5px;
  display: flex;
  flex-direction: column;
  background: none !important;
  text-decoration: none !important;
  z-index: 100;
`;

const DankButton = styled.div`
  cursor: pointer;
  font-size: 22px;
  padding: 10px;
  color: white;
  margin-bottom: 5px;
  transform: scale(1, 1);
  transition: all 0.3s;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  opacity: ${(props) => (props.solid ? 0.8 : 0.68)};
  ${niceShadow}
  z-index: 100;

  svg {
    filter: drop-shadow(1px 1px 2px #3a3939);
  }

  &:hover {
    opacity: 0.9;
    color: #e0e0e0;
    background: rgba(102, 102, 102, 0.7);
    transform: scale(1, 1);
  }

  &:active {
    opacity: 1;
    color: #ffffff;
    background: rgba(0, 0, 0, 0.6);
    transform: scale(0.98, 0.98);
  }
`;

const LittleButton = styled(DankButton)`
  padding: 5px;
  font-size: 16px;
  margin-top: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  curosr: pointer;
  color: white;
`;

const LikeButton = styled(DankButton)`
  margin-left: 5px;
`;

const BakedButton = styled(DankButton)`
  margin-left: 5px;
`;

const PlayButton = styled(DankButton)`
  margin-right: 5px;
  position: absolute;
  bottom: 0;
  right: 0;
`;

const IconContainer = styled.div``;

const IconNumber = styled.div`
  color: white;
  opacity: 0.8;
  font-size: 13px;
  text-shadow: 1px 1px 2px #777777;
  ${niceShadow}
`;

const NumLikes = styled.p`
  font-size: 13px;
  margin-left: 5px;
  margin-bottom: 0;
  opacity: 0.8;
  ${niceShadow}
`;

const NumBakes = styled(NumLikes)``;

const NameText = styled(Link)`
  display: block;
  background: black;
  opacity: 0.6;
  color: white !important;
  margin-bottom: 5px;
  width: fit-content;
  margin-right: 32px;
  text-decoration: none !important;
  line-height: initial;
  padding: 10px;
  ${niceShadow}

  &:visited {
    color: white !important;
  }
`;

const SongName = styled.div`
  cursor: pointer;
  padding: 5px;
  margin-right: 5px;
  position: absolute;
  top: 0;
  left: 0;
  text-decoration: none !important;
  color: white !important;
  ${niceShadow}
  z-index: 100;

  &:visited {
    color: white !important;
  }
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  z-index: 1;
`

var songBoxesCurrentlyRendered = [];
window.forceUpdateSongBoxes = () => {
  songBoxesCurrentlyRendered.forEach((box) => {
    box.forceUpdate();
  });
};

class SongBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      elName: Math.random().toString(36).substring(10),
      numLikes: props.trackInfo.num_likes,
      numBakes: props.trackInfo.num_bakes,
      liked: this.props.trackInfo.liked,
      baked: this.props.trackInfo.baked,
    };

    this.bakeTrack = this.bakeTrack.bind(this);
  }

  componentDidMount() {
    if (!this.props.width || !this.props.height) {
      const nameEl = $(`#name-${this.state.elName}`);
      const elWidth = $(nameEl).width();
      const goodWidth =
        elWidth < 260 ? elWidth + elWidth * (Math.random() / 2 + 1) : elWidth;
      const width = goodWidth < 170 ? 170 : goodWidth > 260 ? 260 : goodWidth;
      const img = $(`.name-${this.state.elName}`);
      img.width(width);
    }
    songBoxesCurrentlyRendered.push(this);
  }

  componentWillUnmount() {
    songBoxesCurrentlyRendered = songBoxesCurrentlyRendered.filter((box) => {
      return box !== this;
    });
  }

  likeTrack = () => {
    if (!window._current_user) {
      return window.location = "/users/sign_up"
    }

    if (this.state.liked) {
      this.setState({
        numLikes: this.state.numLikes - 1,
        liked: false,
      });
    } else {
      this.setState({
        numLikes: this.state.numLikes + 1,
        liked: true,
      });
    }

    $.ajax({
      type: "POST",
      url: "/likes",
      data: { track_id: this.props.trackInfo.id, liked: !this.state.liked },
    });
  };

  bakeTrack = () => {
    if (!window._current_user) {
      return window.location = "/users/sign_up"
    }

    if (this.state.baked) {
      this.setState({
        numBakes: this.state.numBakes - 1,
        baked: false,
      });
    } else {
      this.setState({
        numBakes: this.state.numBakes + 1,
        baked: true,
      });
    }
    
    $.ajax({
      type: "POST",
      url: "/likes",
      data: { track_id: this.props.trackInfo.id, baked: !this.state.baked },
    });
  };

  render() {
    const playerState = window.getPlayerState();
    const thisSongIsCurrentlyPlaying =
      playerState.currentlyPlaying &&
      this.props.trackInfo.id === playerState.id;

    return (
      <SongBoxWrapper showRank={this.props.showRank}>
        <SongName>
          <NameText
            style={{ fontSize: this.props.fontSize || 17 }}
            id={`name-${this.state.elName}`}
            to={`/tracks/${this.props.trackInfo.id}`}
          >
            {this.props.trackInfo.name}
          </NameText>
          <NameText
            style={{ fontSize: this.props.fontSize || 13 }}
            to={artistUrl(this.props.trackInfo.artist_name)}
          >
            {this.props.trackInfo.artist_name}
          </NameText>
        </SongName>
        <BottomLeft>
          <Tippy
            theme="translucent"
            content="Like this track"
            placement="bottom"
          >
            <LikeButton
              onClick={this.likeTrack}
              solid={this.state.liked}
            >
              <IconContainer>
                <FontAwesomeIcon icon={faHeart} />
              </IconContainer>
              <NumLikes>{this.state.numLikes}</NumLikes>
            </LikeButton>
          </Tippy>
          <Tippy
            theme="translucent"
            content="Mark this track as baked"
            placement="bottom"
          >
            <BakedButton
              onClick={this.bakeTrack}
              solid={this.state.baked}
            >
              <IconContainer>🧁</IconContainer>
              <NumBakes>{this.state.numBakes}</NumBakes>
            </BakedButton>
          </Tippy>
        </BottomLeft>
        <TopRight to={`/tracks/${this.props.trackInfo.id}`}>
          {this.props.trackInfo.num_comments > 0 && (
            <Tippy
              theme="translucent"
              content={`${this.props.trackInfo.num_comments} ${
                this.props.trackInfo.num_comments == 1 ? "comment" : "comments"
              }`}
              placement="right"
            >
              <LittleButton solid={false}>
                <IconContainer>
                  <FontAwesomeIcon icon={faComments} />
                </IconContainer>
                <IconNumber>{this.props.trackInfo.num_comments}</IconNumber>
              </LittleButton>
            </Tippy>
          )}
          {this.props.trackInfo.num_rebounds > 0 && (
            <Tippy
              theme="translucent"
              content={`${this.props.trackInfo.num_rebounds} ${
                this.props.trackInfo.num_rebounds == 1 ? "remix" : "remixes"
              }`}
              placement="right"
            >
              <LittleButton solid={false}>
                <IconContainer>
                  <FontAwesomeIcon icon={faRetweet} />
                </IconContainer>
                <IconNumber>{this.props.trackInfo.num_rebounds}</IconNumber>
              </LittleButton>
            </Tippy>
          )}
        </TopRight>
        {thisSongIsCurrentlyPlaying ? (
          <PlayButton
            onClick={() => {
              window.masterAudioTag.pause();
              this.forceUpdate();
            }}
          >
            <IconContainer>
              <FontAwesomeIcon icon={faPause} />
            </IconContainer>
          </PlayButton>
        ) : (
          <PlayButton onClick={this.props.enableTrack}>
            <IconContainer>
              <FontAwesomeIcon icon={faPlay} />
            </IconContainer>
          </PlayButton>
        )}
        <SongImg
          onClick={() => {
            window.location = `/tracks/${this.props.trackInfo.id}`;
          }}
          onLoad={this.props.onLoadImage}
          className={`name-${this.state.elName} songbox`}
          src={this.props.trackInfo.photo}
          style={
            this.props.width && this.props.height
              ? { height: this.props.height, width: this.props.width }
              : {}
          }
        >
          {this.props.trackInfo.video && (
            <Video preload="metadata" muted>
              <source src={this.props.trackInfo.link} />
            </Video>
          )}
        </SongImg>
      </SongBoxWrapper>
    );
  }
}

export default SongBox;

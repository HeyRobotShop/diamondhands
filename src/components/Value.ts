import React from "react";

class Value extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      attr: this.props.attr,
      model: this.props.model
    }
  }
  render(){
    return(
      <>{ this.props.attr }</>
    )
  }
}
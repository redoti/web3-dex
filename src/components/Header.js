import React from "react";
import Logo from "../mixel-logo.png";
import Arb from "../arbitrum-logo.png";
import { Link } from "react-router-dom";

function Header(props) {

  const {address, isConnected, connect} = props;

  return (
    <header>
      <div className="leftH">
        <img src={Logo} alt="logo" className="logo" />
        <Link to="/" className="link">
          <div className="headerItem">Swap</div>
        </Link>
        <Link to="/Portfolio" className="link">
          <div className="headerItem">Portfolio</div>
        </Link>
      </div>
      <div className="rightH">
        <div className="headerItem">
          <img src={Arb} alt="arb" className="arb" />
          Arbitrum
        </div>
        <div className="connectButton" onClick={connect}>
          {isConnected ? (address.slice(0,4) +"..." +address.slice(38)) : "Connect"}
        </div>
      </div>
    </header>
  );
}

export default Header;
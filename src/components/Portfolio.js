import React, { useState, useEffect } from "react";
import { Table, Avatar } from "antd";
import axios from "axios";
import { useAccount } from "wagmi";
import "../Portfolio.css";
import { Alchemy, Network } from "alchemy-sdk";


function Portfolio() {
  const { isConnected, address } = useAccount();
  const [balances, setBalances] = useState([]);
  const config = {
    apiKey: "PuCUG-mzhjx1W_n6WB0VRDNd_Rr0-TfC",
    network: Network.ARB_MAINNET,
  };
  const alchemy = new Alchemy(config);

  const fetchTokenData = async () => {
    try {
      const connectedAddress = address;
      const balances = await alchemy.core.getTokenBalances(connectedAddress);
      const nonZeroBalances = balances.tokenBalances.filter((token) => {
        return token.tokenBalance !== "0";
      });
  
      const tokenData = await Promise.all(
        nonZeroBalances.map(async (token, index) => {
          let balance = token.tokenBalance;
          
          // fetch Metadatas
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
          const tokenName = metadata.name + "(" + metadata.symbol + ")";

          // calculate balance from hex to decimal
          const tokenBalance = balance / Math.pow(10, metadata.decimals);
          const roundedBalance = tokenBalance.toFixed(3);
          
          // fetch Prices
          const response = await axios.get(`https://coins.llama.fi/prices/current/arbitrum:${token.contractAddress}`);
          const tokenPrice = response?.data?.coins?.[`arbitrum:${token.contractAddress}`]?.price;
  
          return {
            name: tokenName,
            balance: roundedBalance,
            decimals: metadata.decimals,
            address: token.contractAddress,
            img: metadata.logo,
            ticker: metadata.symbol,
            price: tokenPrice,
          };
        })
      );
  
      setBalances(tokenData);
    } catch (error) {
      console.error("Error fetching token data:", error);
    }
  };
  
  useEffect(() => {
    fetchTokenData();
  }, []);
  
  const columns = [
    {
      title: "Icon",
      dataIndex: "img",
      key: "img",
      render: (_, token) => <Avatar src={token.img} />,
    },
    {
      title: "Token Name",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (_, token) => <span>{token.name}</span>,
    },
    {
      title: "Price",
      dataIndex: "address",
      key: "price",
      width: "100px",
      align: "center",
      render: (_, token) => {
        const tokenPrice = token.price;
        return tokenPrice ? `$${tokenPrice}` : 0;
      },
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: "100px",
      align: "center",
      render: (balance) => <span>{balance}</span>,
    },
    {
      title: "Value",
      key: "value",
      width: "100px",
      align: "center",
      render: (_, token) => {
          const tokenPrice = token.price;
          const value = tokenPrice ? (tokenPrice * token.balance).toFixed(3) : null;
          return value ? <span>${value}</span> : 0;
      }
    },
  ];

  const mainTable = () => {
    // Filter out balances with value less than 0.001 &
    const filteredBalances = balances.filter((token) => {
      const tokenPrice = token.price;
      const tokenImg = token.img
      const value = tokenPrice ? tokenPrice * token.balance : null;
      return value && value >= 0.001 && tokenImg !== null;
    });
  
    return (
      <>
        <Table
          className="portfolio-table-container && portfolio-table"
          columns={columns}
          dataSource={filteredBalances}
          pagination={false}
        />
      </>
    );
  };

  return (
    <div className="portfolio-container">
      <h2 className="tradeBoxHeader">
        Portfolio Watchlist
        {isConnected}
      </h2>
      {!isConnected && <p>Please connect your wallet</p>}
      {isConnected && mainTable()}
    </div>
  );
}

export default Portfolio;

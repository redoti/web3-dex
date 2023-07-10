import React, { useState, useEffect } from "react";
import { Table, Avatar } from "antd";
import axios from "axios";
import { useAccount } from "wagmi";
import "../Portfolio.css";
import { Alchemy } from "alchemy-sdk";
import config from "../config"

function Portfolio() {
  const { isConnected, address } = useAccount();
  const [balances, setBalances] = useState([]);
  const alchemy = new Alchemy(config);

  const fetchTokenData = async () => {
    try {
      const connectedAddress = address;
      const balances = await alchemy.core.getTokenBalances(connectedAddress);
      const nonZeroBalances = balances.tokenBalances.filter((token) => {
        return token.tokenBalance > "0.00001";
      });
  
      const tokenData = await Promise.all(
        nonZeroBalances.map(async (token) => {
          let balance = token.tokenBalance;
          
          // fetch Metadatas
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
          const tokenName = metadata.name + " (" + metadata.symbol + ")";

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
  
  const sumValue = () => {
    let totalValue = 0;
  
    balances.forEach((token) => {
      const tokenPrice = token.price;
      const value = tokenPrice ? tokenPrice * token.balance : 0;
      totalValue += value;
    });
  
    return totalValue.toFixed(3);
  };

  const sumTokenValue = sumValue();

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
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend"],
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
      sorter: (a, b) => {
        const aPrice = a.price ? a.price : 0;
        const bPrice = b.price ? b.price : 0;
        return aPrice - bPrice;
      },
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: "100px",
      align: "center",
      render: (balance) => <span>{balance}</span>,
      sorter: (a, b) => a.balance - b.balance,
      sortDirections: ["descend", "ascend"],
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
      },
      sorter: (a, b) => {
        const aValue = a.price ? a.price * a.balance : 0;
        const bValue = b.price ? b.price * b.balance : 0;
        return aValue - bValue;
      },
      sortDirections: ["descend", "ascend"],
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
        Portfolio
        {isConnected}
        <span>Total ${sumTokenValue}</span>
      </h2>
      {!isConnected && <p>Please connect your wallet</p>}
      {isConnected && mainTable()}
    </div>
    
  );
}

export default Portfolio;
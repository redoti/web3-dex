import React, { useState, useEffect } from "react";
import { Table, Avatar } from "antd";
import axios from "axios";
import { useAccount } from "wagmi";
import { Alchemy } from "alchemy-sdk";
import { debounce } from "lodash";
import config from "../config";
import "../Portfolio.css";


const Portfolio = () => {
  const { isConnected, address } = useAccount();
  const [balances, setBalances] = useState([]);
  const [sumTokenValue, setSumTokenValue] = useState(0);
  const alchemy = new Alchemy(config);

  const fetchTokenData = async () => {
    try {
      // Get token balances
      const balances = await alchemy.core.getTokenBalances(address);

      // Remove tokens with zero balance
      const nonZeroBalances = balances.tokenBalances.filter((token) => {
        return token.tokenBalance > 0.0001;
      });

      const results = [];

      // Create an array of promises for fetching token data
      const promises = nonZeroBalances.map(async (token) => {
        try {
          // Get balance of token
          let balance = token.tokenBalance;

          // Get metadata of token
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);

          // Compute token balance to decimal
          balance = balance / Math.pow(10, metadata.decimals);
          balance = balance.toFixed(5);

          // Get token price
          const response = await axios.get(
            `https://coins.llama.fi/prices/current/arbitrum:${token.contractAddress}`
          );
          const tokenPrice =
            response?.data?.coins?.[`arbitrum:${token.contractAddress}`]?.price;

          // Return token details
          return {
            name: metadata.name,
            balance: balance,
            decimals: metadata.decimals,
            address: token.contractAddress,
            img: metadata.logo,
            ticker: metadata.symbol,
            price: tokenPrice,
          };
        } catch (error) {
          console.error(
            `Error retrieving data for token at address ${token.contractAddress}:`,
            error
          );
          // Return null for failed promises
          return null;
        }
      });
      // Execute all promises in parallel and wait for their completion
      const settledPromises = await Promise.allSettled(promises);

      // Store valid token details in results array
      for (let promiseResult of settledPromises) {
        if (promiseResult.status === "fulfilled") {
          const data = promiseResult.value;
          results.push(data);
        }
      }

      return results;
    } catch (error) {
      console.error("Error retrieving token balances:", error);
      throw error;
    }
  };

  const fetchData = debounce(async () => {
    try {
      const output = await fetchTokenData();
      setBalances(output);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }, 500); // Adjust the debounce delay (in milliseconds) as per your requirements

  useEffect(() => {
    if (isConnected) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    let totalValue = 0;

    balances.forEach((token) => {
      const tokenPrice = token.price;
      const value = tokenPrice ? tokenPrice * token.balance : 0;
      totalValue += value;
    });

    setSumTokenValue(totalValue.toFixed(4));
  }, [balances]);

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
      key: "[name,ticker]",
      align: "center",
      render: (_, token) => <span>{token.name} ({token.ticker})</span>,
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
    const filteredBalances = balances.filter((token) => {
      const tokenPrice = token.price;
      const tokenImg = token.img;
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
    <div>
      <h2 className="tradeBoxHeader">
        Portfolio
        {isConnected && <span>Total ${sumTokenValue}</span>}
      </h2>
      {!isConnected && <p>Please connect your wallet</p>}
      {isConnected && mainTable()}
    </div>
  );
};

export default Portfolio;
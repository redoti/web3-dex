/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios";
import { useSendTransaction, useWaitForTransaction } from "wagmi";
import { Alchemy } from "alchemy-sdk";
import config from "../config"

function Swap(props) {
  const { address, isConnected } = props;

  // useState hooks to manage component state
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(0.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [txDetails, setTxDetails] = useState({
    to:null,
    data: null,
    value: null,
  });
  
  const alchemy = new Alchemy(config);


  // Custom hooks for sending and waiting for transactions
  const {data, sendTransaction} = useSendTransaction({
    request: {
      from: address,
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: String(txDetails.value),
    }
  })

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  // Event handlers
  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  function changeAmount(e) {
    setTokenOneAmount(e.target.value);
    if (e.target.value && prices) {
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(10));
    } else {
      setTokenTwoAmount(null);
    }
  }
  
  function setMaxAmount() {
    const maxAmount = balances.find(
      (token) => token.contractAddress === tokenOne.address
    ).roundedBalance;
    setTokenOneAmount(maxAmount);
    setTokenTwoAmount((maxAmount * prices.ratio).toFixed(2));
  }

  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i){
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null); 
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address)

      
    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address)
    }
    setIsOpen(false);
  }

  // Fetch token prices from Coingecko API
  async function fetchPrices(one, two) {
    const url1 = `https://coins.llama.fi/prices/current/arbitrum:${one}`;
    const url2 = `https://coins.llama.fi/prices/current/arbitrum:${two}`;
  
    try {
      const response1 = await axios.get(url1);
      const response2 = await axios.get(url2);
      const priceOne = response1.data?.coins?.[`arbitrum:${one}`]?.price;
      const priceTwo = response2.data?.coins?.[`arbitrum:${two}`]?.price;
  
      if (priceOne && priceTwo) {
        const ratio = priceOne / priceTwo;
        setPrices({ tokenOne: priceOne, tokenTwo: priceTwo, ratio });
      } else {
        console.error("Failed to fetch prices");
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  // check  allowance
  async function getAllowance() {
    let tokenAddress = tokenOne.address;
  
    if (tokenAddress === "0x0000000000000000000000000000000000000000") {
      tokenAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    }
  
    const url = `https://api.1inch.io/v5.0/42161/approve/allowance?tokenAddress=${tokenAddress}&walletAddress=${address}`;
  
    try {
      const response = await axios.get(url);
      const data = response.data;
      const decimals = tokenOne.decimals;
      const decimalFactor = 10 ** decimals;
      const numAllow = parseInt(data.allowance);
      const formattedAmount = Math.floor(numAllow / decimalFactor);
  
      console.log(`Your $${tokenOne.ticker} allowance is:`, formattedAmount);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  
  
  // Approve Allowance
  
  async function approveAllowance() {
    try {
      let tokenAddress = tokenOne.address;
      
      if (tokenAddress === "0x0000000000000000000000000000000000000000") {
        tokenAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
      }
      
      const approve = await axios.get(
        `https://api.1inch.io/v5.0/42161/approve/transaction?tokenAddress=${tokenAddress}`
      );
      setTxDetails(approve.data);
      await getAllowance();
    } catch (error) {
      console.error("Failed to approve token allowance:", error);
    }
  }
    
  
  // Do Swap
  async function Swap() {
    try {
      let tokenOneAddress = tokenOne.address;
      let tokenTwoAddress = tokenTwo.address;
  
      if (tokenOneAddress === "0x0000000000000000000000000000000000000000") {
        tokenOneAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
      }
  
      if (tokenTwoAddress === "0x0000000000000000000000000000000000000000") {
        tokenTwoAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
      }
  
      const decimalFactor = 10 ** tokenOne.decimals;
      const formattedAmount = Math.floor(tokenOneAmount * decimalFactor);
  
      const tx = await axios.get(
        `https://api.1inch.io/v5.0/42161/swap?fromTokenAddress=${tokenOneAddress}&toTokenAddress=${tokenTwoAddress}&amount=${formattedAmount}&fromAddress=${address}&slippage=${slippage}`
      );
  
      let decimals = Number(`1E${tokenTwo.decimals}`);
      setTokenTwoAmount((Number(tx.data.toTokenAmount) / decimals).toFixed(2));
      setTxDetails(tx.data.tx);
    } catch (error) {
      console.log(`You need to increase the spending limit`);
      await approveAllowance();
    }
  }
  
  
  // Fetch token prices on component mount
  useEffect(()=>{
    fetchPrices(tokenList[0].address, tokenList[1].address)
  }, [])

  // Send transaction when txDetails change and user is connected
  useEffect(()=>{
    if(txDetails.to && isConnected){
      sendTransaction();
    }
  }, [txDetails])

  // Display loading message when transaction is pending
  useEffect(()=>{
    messageApi.destroy();
    if(isLoading){
      messageApi.open({
        type: 'loading',
        content: 'Transaction is Pending...',
        duration: 0,
      })
    }    
  },[isLoading])


  // Fetch Balances
  const [balances, setBalances] = useState([]);

  const fetchTokenBalances = async () => {
    // Wallet address
    const connectedAddress = address;
    const tokenContractAddresses = [tokenOne.address, tokenTwo.address];
  
    try {
      // Get token balances
      const balances = await alchemy.core.getTokenBalances(
        connectedAddress,
        tokenContractAddresses
      );
  
        balances.tokenBalances.forEach((token) => {
        const decimalBalance =
          parseInt(token.tokenBalance, 16) /
          Math.pow(10, tokenOne.decimals); // Convert hexadecimal to decimal
        const roundedBalance = decimalBalance.toFixed(2); // Round to 2 decimal places
        token.roundedBalance = roundedBalance; // Add roundedBalance property to token object
      });
  
      // Update state with balances
      setBalances(balances.tokenBalances);
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    if (isConnected) {
    fetchTokenBalances();
  }}, [tokenOne, tokenTwo]);
  

  
  // Display success or failure message when transaction completes
  useEffect(()=>{
    messageApi.destroy();
    if(isSuccess){
      messageApi.open({
        type: 'success',
        content: 'Transaction Successful',
        duration: 1.5,
      })
    }else if(txDetails.to){
      messageApi.open({
        type: 'error',
        content: 'Transaction Failed',
        duration: 1.50,
      })
    }
  },[isSuccess])

  // JSX code for the component
  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
            disabled={!prices}
          />
          <div className="tradeBoxMiniPrice">
            ~{prices && prices.tokenOne ? `$${prices.tokenOne}` : ""}
          </div>
          {isConnected && (
          <div className="tradeBoxMiniBalance">
            {/* Display tokenOne balance */}
            {balances.map((token) => {
              if (token.contractAddress === tokenOne.address) {
                return (
                  <div>
                    <div>Balance: {token.roundedBalance}</div>
                    
                  </div>
                );
              }
              return null;
            })}
            
            <div className="maxButton" 
            disabled={ !isConnected} 
            onClick={setMaxAmount}>MAX</div>
          </div>)}
          
          
          <Input 
          placeholder="0" 
          value={tokenTwoAmount} 
          disabled={true}/>
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        <div className="functionButton" >
          <div className="swapButton" disabled={!tokenOneAmount || !isConnected} onClick={approveAllowance}>Approve</div>
          <div className="swapButton" disabled={!tokenOneAmount || !isConnected} onClick={Swap}>Swap</div>
          </div>
        
        

        
      </div>
    </>
  );
}

export default Swap;

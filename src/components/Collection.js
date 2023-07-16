/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Alchemy } from "alchemy-sdk";
import { useAccount } from "wagmi";
import { TwitterOutlined, InfoCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { Avatar, Card, Row, Col } from 'antd';
import '../Collection.css';
import config from "../configEth";
import debounce from 'lodash.debounce';
import etherscan from '../etherscan.svg';
import axios from 'axios';

const { Meta } = Card;

const Collection = () => {
  const alchemy = new Alchemy(config);
  const { isConnected, address } = useAccount();

  const [nftList, setNftList] = useState([]);
  const [ethPrice, setEthPrice] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    if (isConnected) {
      const fetchData = async () => {
        try {
          const nfts = await alchemy.nft.getNftsForOwner(address);
          const ownedNfts = nfts.ownedNfts;

          const promises = ownedNfts.map(async (nft) => {
            const contractAddress = nft.contract.address;
            const tokenId = nft.tokenId;

            if (contractAddress && tokenId) {
              const metadata = await getNFTMetadata(contractAddress, tokenId);

              if (metadata) {
                const nftFloorPrice = metadata?.contract?.openSea?.floorPrice;
                const nftImage = metadata?.media[0]?.gateway;
                const nftThumbnail = metadata?.media[0]?.thumbnail;
                const nftSymbol = metadata?.contract?.symbol;
                const nftContractAddress = metadata?.contract?.address;
                const nftName = metadata?.title;
                const nftUrl = metadata?.contract?.openSea?.externalUrl;
                const nftFormat = metadata?.media[0]?.format;
                const nftTwitter = metadata?.contract?.openSea?.twitterUsername;
                const nftImageUrl = metadata?.contract?.openSea?.imageUrl;

                return {
                  ...nft,
                  metadata: {
                    nftFloorPrice,
                    nftImage,
                    nftThumbnail,
                    nftSymbol,
                    nftContractAddress,
                    nftName,
                    nftUrl,
                    nftFormat,
                    nftTwitter,
                    nftImageUrl,
                    tokenId
                  },
                };
              }
            }
          });

          const updatedNftList = await Promise.all(promises);

          setNftList(updatedNftList.filter(Boolean));
        } catch (error) {
          console.error("Error retrieving NFTs:", error);
        }
      };

      const fetchEthPrice = async () => {
        try {
          const response = await axios.get(
            `https://coins.llama.fi/prices/current/arbitrum:0x0000000000000000000000000000000000000000`
          );
          const ethPrice = response?.data?.coins?.[`arbitrum:0x0000000000000000000000000000000000000000`]?.price;
          setEthPrice(parseFloat(ethPrice || 0));
        } catch (error) {
          console.error("Error retrieving token price:", error);
        }
      };

      const debouncedFetchData = debounce(fetchData, 500);
      debouncedFetchData();
      fetchEthPrice();

      return () => {
        debouncedFetchData.cancel();
      };
    }
  }, [isConnected]);

  useEffect(() => {
    const calculatetotalValue = () => {
      let total = 0;
      nftList.forEach((nft) => {
        const floorPrice = nft.metadata.nftFloorPrice || 0;
        const priceInUSD = floorPrice * ethPrice;
        total += priceInUSD;
      });
      setTotalValue(total.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      })); // Format total with commas
    };
    

    if (isConnected) {
      calculatetotalValue();
    }
  }, [nftList, ethPrice, isConnected]);

  const getNFTMetadata = async (contractAddress, tokenId) => {
    try {
      const response = await alchemy.nft.getNftMetadata(
        contractAddress,
        tokenId
      );
      return response;
    } catch (error) {
      console.error("Error retrieving NFT metadata:", error);
      return null;
    }
  };

  const handleInfoClick = (nftUrl) => {
    if (nftUrl) {
      window.open(nftUrl);
    }
  };

  const handleTwitterClick = (nftTwitter) => {
    if (nftTwitter) {
      const twitterUrl = `https://twitter.com/${nftTwitter}`;
      window.open(twitterUrl);
    }
  };

  const handleEtherClick = (nftContractAddress, tokenId) => {
    if (nftContractAddress && tokenId) {
      const etherscanUrl = `https://etherscan.io/nft/${nftContractAddress}/${tokenId}`;
      window.open(etherscanUrl);
    }
  };

  const usdPrice = (floorPrice) => {
    const priceInUSD = floorPrice * ethPrice;
    const formattedPrice = priceInUSD.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
    return formattedPrice;
  };
  

  return (
    <div className="gallery-container">
      <h2>Collection</h2>
      {isConnected ? (
        <>
          <h3 className="total-price">Total : ${totalValue}</h3>
          <Row gutter={[16, 16]}>
            {nftList.map((nft, index) => (
              nft.metadata.nftImage && (
                <Col lg={6} md={8} xs={24} key={index}>
                  <Card
                    className="card & actions"
                    cover={
                      ['mp4', 'webm', 'mkv', undefined].includes(nft.metadata.nftFormat) ? (
                        <video autoPlay loop
                          src={nft.metadata.nftImage}
                          alt={nft.title}
                          className="cover"
                        />
                      ) : (
                        <img
                          src={nft.metadata.nftImage}
                          alt={nft.title}
                          className="cover"
                        />
                      )
                    }
                    actions={[
                      <div className="icon" onClick={() => handleEtherClick(nft.metadata.nftContractAddress, nft.metadata.tokenId)}>
                        <div 
                        href={nft.metadata.nftContractAddress} 
                        target="_blank" 
                        rel="noopener noreferrer">
                          <img className="etherscan" src={etherscan} alt="Etherscan" />
                        </div>
                      </div>,

                      nft.metadata.nftTwitter ? (
                        <div className="icon" onClick={() => handleTwitterClick(nft.metadata.nftTwitter)}>
                          <div 
                          href={nft.metadata.nftTwitter} 
                          target="_blank" 
                          rel="noopener noreferrer">
                            <TwitterOutlined />
                          </div>
                        </div>
                      ) : (
                        <div className="icon">
                          <CloseCircleOutlined />
                        </div>
                      ),

                      nft.metadata.nftUrl ? (
                        <div className="icon" onClick={() => handleInfoClick(nft.metadata.nftUrl)}>
                          <div 
                          href={nft.metadata.nftUrl} 
                          target="_blank" 
                          rel="noopener noreferrer">
                            <InfoCircleFilled />
                          </div>
                        </div>
                      ) : (
                        <div className="icon">
                          <CloseCircleOutlined />
                        </div>
                      )
                    ]}
                  >
                    <Meta
                      avatar={<Avatar src={nft.metadata.nftThumbnail || nft.metadata.nftImageUrl} />}
                      title={<span className="title">{nft.title}</span>}
                      description={
                        <span className="description">
                          Floor Price: {nft.metadata.nftFloorPrice || 0} ETH 
                          (${usdPrice(nft.metadata.nftFloorPrice || 0)})
                        </span>
                      }
                    />
                  </Card>
                </Col>
              )
            ))}
          </Row>
        </>
      ) : (
        <div>
          Please connect your wallet
        </div>
      )}
    </div>
  );
};

export default Collection;
